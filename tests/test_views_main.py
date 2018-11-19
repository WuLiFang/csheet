# -*- coding=UTF-8 -*-
"""Test `csheet.views.main` module.  """

from urllib.parse import quote

import pytest
from flask import Response

import util
from csheet import APP


@pytest.fixture(name='client')
def _client():
    client = APP.test_client()
    if util.IS_CGTEAMWORK_LOGGED_IN:
        client.post('/_login')
    return client


def test_json(client):
    url_list = [f"/?root={quote(util.path('storage', 'local'))}"]
    if util.IS_CGTEAMWORK_LOGGED_IN:
        url_list.append(
            '/?pipeline=%E5%90%88%E6%88%90&project=%E6%A2%A6%E5%A1%94&prefix=MT_EP06_')

    for i in url_list:
        resp: Response = client.get(i,
                                    headers={'accept': 'application/json'})
        assert resp.mimetype == 'application/json'
        data = resp.json
        assert isinstance(data, dict)
        assert 'videos' in data
        assert 'tags' in data
