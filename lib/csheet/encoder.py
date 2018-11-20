"""JSon encoder.  """

from flask import json

from . import database


class JSONEncoder(json.JSONEncoder):
    """Custom json encoder.  """

    def default(self, o):
        #pylint: disable=E0202
        if isinstance(o, database.core.SerializableMixin):
            return o.serialize()

        return super().default(o)


def normalize(obj):
    """Convert object to json capable object"""
    # XXX: should be handle by framework
    # but `flask-socketio` has strange behavior
    return json.loads(json.dumps(obj))
