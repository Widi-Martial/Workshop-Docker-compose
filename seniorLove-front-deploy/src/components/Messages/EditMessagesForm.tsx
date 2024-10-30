import { useState } from 'react';
import { AxiosError } from 'axios';
import axios from '../../axios';
import DefaultBtn from '../standaloneComponents/Button/DefaultBtn';
import Error500Page from '../../pages/Error500Page';

interface EditMessage {
  setBadSend: React.Dispatch<React.SetStateAction<boolean>>;
  badSend: boolean;
  send: (id: number) => void;
  receiverId: number;
}

export default function EditMessagesForm({
  send,
  receiverId,
  badSend,
  setBadSend,
}: EditMessage) {
  // STATE 1 : message
  const [message, setMessage] = useState('');

  // STATE 2 : error server
  const [serverError, setServerError] = useState(false);

  const submitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    // Check if message is not empty before sending to API
    if (formData.sendMessage.toString().length === 0) {
      return;
    }
    try {
      await axios.post('/private/messages', {
        message: formData.sendMessage,
        receiver_id: receiverId,
      });
      send(receiverId);
      setMessage('');
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError && err.response?.status === 403) {
        setBadSend(true);
        setMessage('');
      } else {
        setServerError(true);
      }
    }
  };

  if (serverError) {
    return <Error500Page />;
  }

  return (
    <form
      action="post"
      className="bg-transparent shadow-message"
      id="formMessage"
      onSubmit={(e) => submitMessage(e)}
    >
      {badSend && (
        <p className="text-red-500 text-xs text-center">
          Ce contact n&apos;est plus disponible pour recevoir des messages.
        </p>
      )}
      <input
        type="text"
        name="sendMessage"
        placeholder="Ecrivez un message..."
        className="border-y shadow-inner w-full h-15 px-2"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <DefaultBtn btnType="submit" btnText="Envoyer" />
    </form>
  );
}
