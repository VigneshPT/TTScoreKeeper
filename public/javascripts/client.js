var socket = io.connect('http://localhost:35105');
function stopUpdating()
{
    socket.emit('stopUpdating');
}
socket.on('connected', function () {
    alert('hello world');
});
socket.on('updateCount', function () {
    //console.log(data);
    var current = parseInt(document.getElementById('countDiv').innerHTML,10);
    document.getElementById('countDiv').innerHTML = current+1;
    //socket.emit('my other event', { my: 'data' });
}); 