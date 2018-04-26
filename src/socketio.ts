import * as io from 'socket.io-client';
import * as $ from 'jquery';


$(document).ready(
    () => {
        const socket = io(`/`, { path: '/api/socket.io' })
        socket.on('new asset',
            (message: string) => {
                console.log(message)
            }
        )
        socket.on('connect',
            () => { console.log('connected') }
        )
        socket.on('disconnect',
            () => {
                console.log('disconnect')
            }
        )
    }
)