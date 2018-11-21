# -*- coding=UTF-8 -*-
"""Application core.  """

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import logging.config
import os

import celery
import flask
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


CELERY = celery.Celery(APP.import_name, task_cls=ContextTask)


@APP.teardown_appcontext
def _teardown_session(exc):
    if exc and database.Session.registry.has():
        database.Session().rollback()
    database.Session.remove()


def init():
    """Initiate application.  """

    logging.config.dictConfig(APP.config['LOGGING_CONFIG'])
    CELERY.config_from_object(APP.config['CELERY_CONFIG'])
    database.core.bind(
        url=APP.config['DATABASE_URL'],
        is_echo=APP.config['DEBUG_SQL'])

    dsn = APP.config['BACKEND_SENTRY_DSN']
    if dsn:
        import sentry_sdk
        from sentry_sdk.integrations.celery import CeleryIntegration
        from sentry_sdk.integrations.flask import FlaskIntegration
        sentry_sdk.init(
            dsn=dsn,
            release=__version__,
            integrations=[FlaskIntegration(), CeleryIntegration()])


init()
