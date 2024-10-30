import { useEffect, useState } from 'react';
import { IContacts } from '../../@types/IContacts';
import axios from '../../axios';

interface ConversationPreviewProps {
  selectedContact: (newMessages: IContacts) => void;
  contact: IContacts;
  setBadSend: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: () => void;
  isSelected: boolean;
  switchView: () => void;
}

export default function ConversationPreview({
  contact,
  selectedContact,
  setBadSend,
  onSelect,
  isSelected,
  switchView,
}: ConversationPreviewProps) {
  const lastMessage = contact.messages[contact.messages.length - 1];
  const { message }: { message: string } = lastMessage;
  // message lu ou non lu
  const [newMessage, setNewMessage] = useState<boolean>();

  async function handleReadMessage(contactId: number) {
    await axios.put('private/messages/read', {
      contactId,
    });
    setNewMessage(false);
  }

  useEffect(() => {
    const even = (noRead: any) =>
      noRead.sender_id === contact.id && !noRead.read;
    setNewMessage(contact.messages.some(even));
  }, []);

  return (
    <button
      type="button"
      className={`p-2 hover:shadow-around max-md:shadow-md ${isSelected ? 'md:shadow-pink' : ''} w-full rounded-3xl relative`}
      onClick={() => {
        selectedContact(contact);
        setBadSend(false);
        onSelect();
        handleReadMessage(contact.id);
        if (window.innerWidth <= 768) {
          switchView();
        }
      }}
    >
      {newMessage && (
        <span
          className="absolute text-xs italic text-corailNotification top-0 right-0 animate-pulse"
          aria-label="Nouveau message"
        >
          Nouveau
        </span>
      )}
      <div className="flex justify-start">
        <img
          src={contact.picture}
          alt="Expediteur"
          className="aspect-square rounded-full size-20 object-cover shadow-lg"
        />
        <div>
          <h2 className="mb-1.5 text-sm p-2 text-left font-medium text-secondaryPink">
            {contact.name}
          </h2>
          <p
            className={`p-2 ${newMessage ? 'font-semibold text-primaryText' : ''} text-xs text-gray-400 block`}
          >
            {`${message.substring(0, 50)}...`}
          </p>
        </div>
      </div>
    </button>
  );
}
