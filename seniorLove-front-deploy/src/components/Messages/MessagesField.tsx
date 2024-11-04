import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import axios from '../../axios';
import ContactsListField from './ContacstListField';
import EditMessagesForm from './EditMessagesForm';
import ReceivedMessage from './ReceivedMessage';
import SentMessage from './SentMessage';
import { IContacts } from '../../@types/IContacts';
import Loader from '../standaloneComponents/Loader/Loader';
import Error500Page from '../../pages/Error500Page';
import { removeTokenFromLocalStorage } from '../../localStorage/localStorage';
import DefaultBtn from '../standaloneComponents/Button/DefaultBtn';

export default function MessagesField() {
  // STATE 1 : all Data messages
  const [messagesData, setMessagesData] = useState<IContacts[]>([]);
  // STATE 2 : data message to display
  const [displayMessages, setDisplayMessages] = useState<IContacts>();
  // STATE 3 : status of message sent and recipient id
  const [sendMessage, setSendMessage] = useState({
    sendStatus: false,
    lastReceiverId: displayMessages?.id,
  });
  // STATE 4 : state to change css classes
  const [toggleDisplay, setToggleDisplay] = useState<boolean>(false);
  // STATE 5 : state to indicate that the api is returning a 403 (user not found  ou blocked)
  const [badSend, setBadSend] = useState<boolean>(false);
  // STATE 6 : loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // STATE 7 : error server
  const [serverError, setServerError] = useState(false);

  // Import of navigate to force redirection when forced logged out
  const navigate = useNavigate();
  // create reference for html element²
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // get user's contacts and conversation
    const fetchMessages = async () => {
      try {
        const result = await axios.get('/private/contacts');
        setMessagesData(result.data);
        if (sendMessage.lastReceiverId) {
          setDisplayMessages(
            result.data.find(
              (data: IContacts) => data.id === sendMessage.lastReceiverId
            )
          );
        } else {
          // Put first entrie of result into the state to display message
          setDisplayMessages(result.data[0]);
        }
      } catch (err) {
        console.error(err);
        // check if is Axios error and if the user is not blocked
        if (err instanceof AxiosError && err.response?.data.blocked) {
          // if blocked, logout user
          removeTokenFromLocalStorage();
          navigate('/loggedout');
        } else {
          // set true to display an errorPage
          setServerError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();

    // sets the state to true for the default display of css classes for the desktop view
    if (window.innerWidth >= 768) {
      setToggleDisplay(true);
    }
  }, [sendMessage]);

  const handleUpdateMessages = (newMessages: IContacts) => {
    setDisplayMessages(newMessages);
  };

  // change state status to refresh component
  const handleSendMessages = (id: number) => {
    setSendMessage({ sendStatus: !sendMessage.sendStatus, lastReceiverId: id });
  };

  // sets the state to false to change css classe and display component's mobile view
  const handleToggleMessageView = () => {
    setToggleDisplay(false);
  };

  // get id's member in displayMessage
  const idSent = Number(displayMessages?.id);

  useEffect(() => {
    // ²Scroll down automatically
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [displayMessages]);

  // display error page if error axios
  if (serverError) {
    return <Error500Page />;
  }

  // loader
  if (isLoading) {
    return <Loader />;
  }
  // return elements
  return (
    <main className="flex flex-col w-full items-center justify-center bg-backgroundPink pb-8 flex-1">
      <div className="w-full lg:w-5/6 xl:w-4/6 px-3">
        {!toggleDisplay && (
          <div className="mt-4">
            <DefaultBtn
              btnText="Revenir aux contacts"
              btnMessageMobile
              onClick={() => setToggleDisplay(true)}
            />
          </div>
        )}
        {messagesData.length === 0 ? (
          <p className="text-center font-semibold pt-6">
            Vous n&apos;avez pas de messages !
          </p>
        ) : (
          <div className="md:flex mt-6 md:w-full">
            <ContactsListField
              listContacts={messagesData}
              selectedContact={handleUpdateMessages}
              setBadSend={setBadSend}
              toggleDisplay={toggleDisplay}
              switchView={handleToggleMessageView}
            />
            <div
              className={`${toggleDisplay ? 'hidden' : ''} md:block w-full `}
            >
              <div
                className="md:rounded-r-3xl max-md:rounded-3xl bg-white border 
              flex flex-col justify-between w-full h-[calc(100vh-300px)] md:h-[calc(100vh-400px)]"
              >
                <div
                  ref={messagesContainerRef}
                  className="w-full flex flex-col overflow-y-scroll md:overflow-y-auto"
                >
                  {displayMessages?.messages.map((message) => {
                    if (displayMessages.id === message.sender_id) {
                      return (
                        <ReceivedMessage
                          receiveMessage={message.message}
                          userId={displayMessages.id}
                          key={message.id}
                          picture={displayMessages.picture}
                          time={message.created_at}
                        />
                      );
                    }
                    return (
                      <SentMessage
                        sentMessage={message.message}
                        key={message.id}
                        isView={message.read}
                      />
                    );
                  })}
                </div>
                <EditMessagesForm
                  badSend={badSend}
                  setBadSend={setBadSend}
                  send={handleSendMessages}
                  receiverId={idSent}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
