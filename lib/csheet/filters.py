"""Template filters.  """

import json
from functools import partial

from . import database
from .core import APP


def _json_default(obj):
    if isinstance(obj, database.core.SerializableMixin):
        return obj.serialize()

    return json.JSONEncoder().default(obj)


@APP.template_filter('dumps')
def dumps(*args, **kwargs):
    """Dump objects to string.

    Returns:
        str
    """

    return partial(json.dumps, default=_json_default)(*args, **kwargs)
