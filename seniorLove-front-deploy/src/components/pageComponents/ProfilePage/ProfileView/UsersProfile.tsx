import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import axios from '../../../../axios';
import { IUsers } from '../../../../@types/IUsers';
import EventSticker from '../../../standaloneComponents/EventSticker/EventSticker';
import Loader from '../../../standaloneComponents/Loader/Loader';
import Error500Page from '../../../../pages/Error500Page';
import DefaultBtn from '../../../standaloneComponents/Button/DefaultBtn';
import { removeTokenFromLocalStorage } from '../../../../localStorage/localStorage';

export default function UsersProfile() {
  const { userId } = useParams<{ userId: string }>(); // Récupère l'id de l'utilisateur à partir de l'URL
  // STATE 1 : profile
  const [profile, setProfile] = useState<IUsers | null>(null);

  // STATE 2 : loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // STATE 3 : error
  const [isError, setIsError] = useState<number | null>(null);

  // STATE 4 : send message
  const [isSendMessage, setIsSendMessage] = useState<boolean>(false);

  // STATE 5 : message error
  const [isErrorMessage, setIsErrorMessage] = useState<boolean>(false);

  // STATE 6 : state to store the text field values
  const [messageField, setMessageField] = useState<string>('');
  const [messageFieldMobile, setMessageFieldMobile] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/private/users/${userId}`);
        setProfile(response.data); // Stocke les données de l'utilisateur dans le state
      } catch (e) {
        if (
          e instanceof AxiosError &&
          (e.response?.data.blocked || e.response?.status === 401)
        ) {
          removeTokenFromLocalStorage();
          navigate('/loggedout');
        } else if (e instanceof AxiosError && e.response?.status === 404) {
          console.error(e);
          setIsError(404);
        } else {
          setIsError(500);
          console.log(e);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate, userId]); // L'ID de l'utilisateur est utilisé comme dépendance pour relancer le fetch si nécessaire

  const sendMessage = async () => {
    let message = '';
    // Check if the text fields is not empty
    if (messageField.trim().length > 0) {
      message = messageField.trim();
    } else if (messageFieldMobile.trim().length > 0) {
      message = messageFieldMobile;
    } else {
      return;
    }
    // Send the message to the backend
    try {
      await axios.post(`/private/messages`, {
        message,
        receiver_id: userId,
      });
      setIsSendMessage(false);
      navigate('/messages');
    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError && e.response?.status === 403) {
        setIsErrorMessage(true);
      } else {
        setIsError(500);
      }
    }
  };

  // Toggle the message textarea
  const handleMessageToggle = () => {
    if (isSendMessage) {
      sendMessage();
    } else {
      setIsSendMessage(true);
    }
  };

  if (isError === 404) {
    return <Navigate to="/error" />;
  }

  if (isError === 500) {
    return <Error500Page />;
  }

  if (isLoading) {
    return (
      <section className=" justify-center md:items-center flex md:px-16 md:h-screen">
        <Loader />
      </section>
    );
  }

  if (!profile) {
    return <Navigate to="/error" />;
  }

  return (
    <div className="w-full min-h-full flex-grow flex flex-col items-center justify-between bg-primaryGrey">
      <div className="flex flex-col pt-8 px-8 max-w-7xl w-full gap-10 md:flex-row">
        {/* Aside in desktop view */}
        <div className="flex flex-col items-center gap-5 md:w-1/3">
          <img
            src={profile.picture}
            alt={profile.name}
            className="max-w-64 md:max-w-full rounded-md border border-secondaryPink"
          />
          <div className="font-semibold flex flex-col text-center justify-between md:hidden">
            <div>
              <span className="text-3xl text-secondaryPink">
                {profile.name}
              </span>
              , {profile.age} ans
            </div>
            <div className="pt-4">
              <DefaultBtn
                btnText="Envoyer un message"
                btnPage="profile"
                onClick={handleMessageToggle}
                btnMessage={isSendMessage}
              />
            </div>
            {isSendMessage ? (
              <>
                {isErrorMessage && (
                  <p className="text-red-500 text-xs text-center mt-2">
                    Ce contact n&apos;est plus disponible pour recevoir des
                    messages.
                  </p>
                )}
                <textarea
                  rows={3}
                  name="messageFieldMobile"
                  id="messageFieldMobile"
                  value={messageFieldMobile}
                  onChange={(e) => setMessageFieldMobile(e.target.value)}
                  placeholder="Écrire votre message ici"
                  className="p-2 my-2 font-normal"
                />
              </>
            ) : null}
          </div>
          <div>
            <h2 className="text-xl text-center font-semibold text-secondaryPink pb-3">
              Mes Centres d&apos;intérêt
            </h2>
            <div className="flex flex-wrap justify-around gap-2">
              {profile.hobbies.map((hobby) => (
                <span
                  key={hobby.id}
                  className="bg-primaryPink text-primaryText font-medium rounded-lg text-sm py-1 px-2"
                >
                  {hobby.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:w-2/3 flex flex-col gap-3 md:gap-6">
          <div className="hidden font-semibold md:flex text-center justify-between">
            <div>
              <span className="text-3xl text-secondaryPink">
                {profile.name}
              </span>
              , {profile.age} ans
            </div>
            <div className="flex gap-3">
              <DefaultBtn
                btnText="Envoyer un message"
                btnPage="profile"
                onClick={handleMessageToggle}
                btnMessage={isSendMessage}
              />
            </div>
          </div>
          {isSendMessage && (
            <>
              {isErrorMessage && (
                <p className="text-red-500 text-xs text-center mt-2">
                  Ce contact n&apos;est plus disponible pour recevoir des
                  messages.
                </p>
              )}
              <textarea
                rows={3}
                name="messageField"
                value={messageField}
                onChange={(e) => setMessageField(e.target.value)}
                placeholder="Écrire votre message ici"
                className="p-2 my-2 hidden md:block"
              />
            </>
          )}
          <div>
            <h3 className="text-xl text-secondaryPink text-center font-semibold pb-3 md:text-black md:text-left ">
              A propos de moi :
            </h3>

            <p className="text-primaryText text-justify">
              {profile.description}
            </p>
          </div>
          {/* Add more editable fields here as needed */}
          <div className="pt-8">
            <h3 className="text-xl text-secondaryPink text-center font-semibold md:text-black pb-3">
              Mes prochaines sorties :
            </h3>
            {profile.events && profile.events.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-5 md:gap-10 py-5">
                {profile.events.map((event) => (
                  <EventSticker event={event} key={event.id} page="profile" />
                ))}
              </div>
            ) : (
              <p className="text-center py-6">
                Je ne suis actuellement enregistré à aucun futur événement.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
