"""Jinja2 context processors.  """

from .core import APP


@APP.context_processor
def _inject_sentry_dsn():
    return {'SENTRY_DSN': APP.config['FRONTEND_SENTRY_DSN'] or ''}
