import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  getTokenAndDataFromLocalStorage,
  removeTokenFromLocalStorage,
} from '../../../localStorage/localStorage';

interface UserHeadbandProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserHeadband({
  setIsAuthenticated,
}: UserHeadbandProps) {
  const [newPicture, setNewPicture] = useState<string | null>(null);
  const [newName, setNewName] = useState<string | null>(null);

  useEffect(() => {
    const fetchPicture = () => {
      const response = getTokenAndDataFromLocalStorage();
      const { name, picture } = response || { name: null, picture: null };
      setNewPicture(picture);
      setNewName(name);
    };

    // Fetch immediately on mount
    fetchPicture();

    // Set up an interval to fetch data periodically
    const intervalId = setInterval(fetchPicture, 1000); // Fetch data every second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const onClickDisconnect = () => {
    setIsAuthenticated(false);
    removeTokenFromLocalStorage();
  };
  return (
    <div className="bg-gradient-to-r from-gray-100 via-white to-gray-100 p-2 w-full font-bold text-primaryText">
      <div className="flex items-center justify-center space-x-4">
        <Link to="/myprofile">
          <img
            src={newPicture ?? ''}
            alt={newName ?? ''}
            className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover shadow-around"
          />
        </Link>
        <div>
          <p className="italic text-base font-normal md:text-lg lg:text-xl">
            Bienvenue {newName} !
          </p>
          <Link
            to="/"
            onClick={() => onClickDisconnect()}
            className="text-sm md:text-lg text-secondaryPink hover:text-primaryText font-semibold py-2 px-3"
          >
            Déconnexion
          </Link>
        </div>
      </div>
    </div>
  );
}
