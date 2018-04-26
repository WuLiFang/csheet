import * as io from 'socket.io-client';
import * as $ from 'jquery';
import Notify from 'notifyjs';


$(document).ready(
    () => {
        Notify.requestPermission()
        const socket = io(`/`, { path: '/api/socket.io' })
        socket.on('new asset',
            (message: string) => {
                console.log(message)
            }
        )
        socket.on('connect',
            () => { new Notify('已建立连接', { timeout: 2 }).show() }
        )
        socket.on('disconnect',
            () => {
                new Notify('连接断开', { timeout: 2 }).show()
            }
        )
    }
)