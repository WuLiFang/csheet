# -*- coding=UTF-8 -*-
"""Application core.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import logging.config
import os

import celery
import flask
from celery import signals as c_signals
from flask import session
from flask_socketio import SocketIO

from . import database, filetools
from .__about__ import __name__ as name
from .__about__ import __version__
from .encoder import JSONEncoder

APP = flask.Flask(name, root_path=filetools.dist_path())
APP.json_encoder = JSONEncoder
APP.secret_key = os.getenv('SECRET_KEY', ('}w\xb7\xa3]\xfaI\x94Z\x14\xa9\xa5}\x16\xb3'
                                          '\xf7\xd6\xb2R\xb0\xf5\xc6*.\xb3I\xb7\x066V\xd6\x8d'))
APP.config.from_object('csheet.default_settings')
APP.config.from_envvar('CSHEET_SETTINGS', silent=True)

SOCKETIO = SocketIO(app=APP,
                    path='/api/socket.io',
                    message_queue=APP.config['MESSAGE_QUEUE_URL'])


class ContextTask(celery.Task):
    """Task with flask app context.  """

    def __call__(self, *args, **kwargs):
        with APP.app_context():
            return self.run(*args, **kwargs)

    def run(self, *args, **kwargs):
        """The body of the task executed by workers."""
        raise NotImplementedError('Tasks must define the run method.')


@APP.teardown_appcontext
def _teardown_session(_exc):
    database.Session.remove()


@c_signals.worker_init.connect
def _dispose_db_connection(**_kwargs):
    database.core.get_engine().dispose()


CELERY = celery.Celery(APP.import_name, task_cls=ContextTask)


def init():
    """Initiate application.  """

    database.core.bind(
        url=APP.config['DATABASE_URL'],
        is_echo=APP.config['DEBUG_SQL'])

    CELERY.config_from_object(APP.config['CELERY_CONFIG'])
    logging.config.dictConfig(APP.config['LOGGING_CONFIG'])

    dsn = APP.config['BACKEND_SENTRY_DSN']
    if dsn:
        import sentry_sdk
        from sentry_sdk.integrations.celery import CeleryIntegration
        from sentry_sdk.integrations.flask import FlaskIntegration
        sentry_sdk.init(
            dsn=dsn,
            environment=os.getenv('SENTRY_ENVIRONMENT', 'development'),
            release=__version__,
            integrations=[FlaskIntegration(), CeleryIntegration()])

        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("commit_sha1", os.getenv("COMMIT_SHA1"))

        @APP.before_request
        def _setup_sentry():
            with sentry_sdk.configure_scope() as scope:
                scope.user = {
                    "id": session.get('account_id'),
                    "username": session.get('name')}


@APP.before_first_request
def migrate():
    database.core.upgrade(APP.config['DATABASE_URL'])


init()
