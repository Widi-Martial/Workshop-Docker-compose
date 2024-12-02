import Logo from '/img/logo-text-seniorlove.webp';
import MobileNavBarLogged from '../MobileNavBar/MobileNavBarLogged';
import { Link, NavLink } from 'react-router-dom';

export default function NavBarLogged() {
  const NavBarButtons = [
    { text: 'Accueil', to: '/home' },
    { text: 'Découvrir', to: '/profiles' },
    { text: 'Evènements', to: '/events' },
    { text: 'Messages', to: '/messages' },
    { text: 'Mon profil', to: 'myprofile' },
  ];

  return (
    <header className="bg-white bg-opacity-90 md:sticky top-0 w-full py-4 z-10">
      <nav className="flex justify-center md:justify-between items-center w-full px-3">
        <Link to="/home">
          <img
            src={Logo}
            alt="Retour à l'accueil"
            className="max-w-36 lg:max-w-52"
          />
        </Link>
        <div className="flex gap-2 flex-wrap justify-end">
          {NavBarButtons.map((button) => (
            <NavLink
              to={button.to}
              key={button.text}
              className="text-secondaryPink hover:text-primaryText font-semibold py-2 px-3 hidden md:block rounded-full bg-[#ebebea]"
              style={({ isActive }) => {
                return {
                  backgroundColor: isActive ? '#E86484' : '',
                  color: isActive ? 'white' : '',
                };
              }}
            >
              {button.text}
            </NavLink>
          ))}
        </div>
      </nav>
      <MobileNavBarLogged />
    </header>
  );
}
