import React from 'react'
import RoomList from './components/RoomList'
import NewRoomForm from './components/NewRoomForm'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'


import './App.css'


  return (
    <>
      <div className="app">
        <RoomList />
        <NewRoomForm />
        <MessageList />
        <SendMessageForm />
      </div>
    </>
  )
}

export default App
