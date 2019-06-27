
"""Test `csheet.views.api` module.  """
from flask import Response

import util


@util.skip_if_not_logged_in
def test_cgteamwork_task(client):
    resp: Response = client.get(
        '/api/task/1B37340B-57AD-8D44-6951-971CC148A13A')

    data = resp.json
    assert data, resp.data
    assert isinstance(data, dict)
    if resp.status_code == 200:
        assert (set(data.keys())
                .issuperset(set(['uuid', 'permissions', 'artists',
                                 'shot', 'leader_status', 'director_status',
                                 'client_status'])))
