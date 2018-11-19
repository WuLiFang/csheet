# -*- coding=UTF-8 -*-
"""Test `csheet.views.main` module.  """

import pytest

import util
from csheet import APP, views


@pytest.fixture(name='client')
def _client():
    client = APP.test_client()
    if util.IS_CGTEAMWORK_LOGGED_IN:
        client.post('/_login')
    return client


def test_json(client):
    url_list = ['/?root=D%3A%5CUsers%5C34357%5CPictures%5CCollection']
    if util.IS_CGTEAMWORK_LOGGED_IN:
        url_list.append(
            '/?pipeline=%E5%90%88%E6%88%90&project=%E6%A2%A6%E5%A1%94&prefix=MT_EP06_')

    for i in url_list:
        resp = client.get(i,
                          headers={'accept': 'application/json'})

        assert resp.content_type == 'application/json'
