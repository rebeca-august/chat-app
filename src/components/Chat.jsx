import React, { useEffect, useRef } from 'react'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  useMutation,
  gql,
} from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'

const link = new WebSocketLink({
  uri: 'ws://localhost:4000/subscriptions',
  options: {
    reconnect: true,
  },
})

const client = new ApolloClient({
  link,
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
})

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      content
    }
  }
`
const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`

const scrollToBottom = (element) => {
  if (element) {
    element.scrollTop = element.scrollHeight
  }
}

const Messages = ({ user }) => {
  const messagesContainerRef = useRef(null)
  const { data } = useSubscription(GET_MESSAGES)
  useEffect(() => {
    scrollToBottom(messagesContainerRef.current)
  })

  if (!data) {
    return null
  }

  return (
    <div className="messagesContainer" ref={messagesContainerRef}>
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          key={id}
          style={{
            display: 'flex',
            justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
            margin: '15px 10px',
            paddingBottom: '1em',
          }}
        >
          {user !== messageUser && (
            <div
              style={{
                marginRight: '0.5em',
                border: '2px solid #00000040',
                borderRadius: 30,
                textAlign: 'center',
                fontSize: '18pt',
                padding: 15,
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? '#58bf56' : '#e5e6ea',
              color: user === messageUser ? 'white' : 'black',
              padding: '1em',
              borderRadius: '1em',
              maxWidth: '60%',
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </div>
  )
}

const Chat = () => {
  const [state, setState] = React.useState({
    user: 'Jack',
    content: '',
  })

  const [postMessage] = useMutation(POST_MESSAGE)

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      })
    }
    setState({
      ...state,
      content: '',
    })
  }

  return (
    <>
      <Messages user={state.user} />
      <div className="formContainer">
        <form className="chatForm">
          <input
            className="userForm"
            name="User"
            value={state.user}
            placeholder="User Name"
            onChange={(e) => setState({ ...state, user: e.target.value })}
          />
          <input
            className="contentForm"
            name="Content"
            value={state.content}
            placeholder="User Message"
            onChange={(e) => setState({ ...state, content: e.target.value })}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                onSend()
              }
            }}
          />
        </form>
        <button className="button" onClick={() => onSend()}>
          SEND
        </button>
      </div>
    </>
  )
}

const globalProvider = () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
)

export default globalProvider
