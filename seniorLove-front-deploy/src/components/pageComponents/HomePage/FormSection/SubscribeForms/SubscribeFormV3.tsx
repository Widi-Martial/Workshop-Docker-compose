import { useState, useEffect } from 'react';

import DefaultBtn from '../../../../standaloneComponents/Button/DefaultBtn';
import Logo from '/img/logo-text-seniorlove.webp';
import { IRegisterForm } from '../../../../../@types/IRegisterForm';
import stepThreeSchema from '../../../../../utils/joiValidateFormV3';

interface SubscribeFormV3Props {
  formInfos: IRegisterForm;
  setIsForm3Validated: React.Dispatch<React.SetStateAction<boolean>>;
  fillFormInfos: (incomingInfos: object) => void;
  onPreviousClick: () => void;
}

export default function SubscribeFormV3({
  formInfos,
  setIsForm3Validated,
  fillFormInfos,
  onPreviousClick,
}: SubscribeFormV3Props) {
  // STATE 1 : picture input value
  const [pictureFile, setPictureFile] = useState<File | null>(null);

  // STATE 2 : description input value
  const [descriptionInputValue, setDescriptionInputValue] =
    useState<string>('');

  // STATE 3 : error
  const [errorTo, setError] = useState<string | null>(null);

  // Handle picture input change
  // const handlePictureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setPictureFile(e.target.files[0]); // Save the selected file in state
  //   }
  // };

  // Handle description input change
  const handleDescriptionInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescriptionInputValue(e.currentTarget.value);
  };

  const handleValidateFormV3 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = stepThreeSchema.validate(
      {
        descriptionInputValue,
        pictureFile,
      },
      { abortEarly: false }
    );

    if (error) {
      setError(error.details[0].message);
      return;
    }

    try {
      // Prepare form data with file and description
      const formData = new FormData();
      if (pictureFile) {
        formData.append('picture', pictureFile); // File upload
      }
      formData.append('description', descriptionInputValue);

      // Update form info with picture and description
      fillFormInfos({
        picture: pictureFile,
        description: descriptionInputValue,
      });

      setError(null);
      setIsForm3Validated(true); // Mark step 3 as validated
    } catch (err) {
      setError('Une erreur est survenue lors de la soumission du formulaire.');
    }
  };

  useEffect(() => {
    if (formInfos.picture && formInfos.description) {
      setPictureFile(formInfos.picture);
      setDescriptionInputValue(formInfos.description);
    }
  }, [formInfos]);

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );

  // State to store the selected image file

  // Event handler for file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set image preview in state
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      setImagePreview(null); // Clear preview if no file is selected
    }
    if (e.target.files && e.target.files[0]) {
      setPictureFile(e.target.files[0]); // Save the selected file in state
    }
  };

  return (
    <div className="bg-white opacity-90 px-10 pb-10 pt-4 rounded-xl shadow-md my-10 mx-4 md:mx-auto md:my-0">
      <div className="flex flex-col items-center justify-center mb-4">
        <img src={Logo} alt="" className="max-w-44 mb-4" />
      </div>
      <p className="mb-4 text-lg text-primaryText font-semibold text-center">
        Commencez à remplir votre profil
      </p>
      <form
        className="text-primaryText"
        encType="multipart/form-data"
        onSubmit={handleValidateFormV3}
      >
        <label
          htmlFor="doc"
          className="flex items-center px-8 py-1 md:py-3 gap-3 rounded-3xl border border-gray-300 border-dashed bg-gray-100 cursor-pointer"
        >
          <img
            className="h-6 w-auto"
            src="/icon/upload.svg"
            alt="Télécharger"
          />
          <div className="space-y-2">
            <h4 className="text-sm md:text-base font-semibold text-gray-700 text-center">
              Charger une photo
            </h4>
          </div>
          <input
            type="file"
            id="doc"
            name="doc"
            accept="png, jpg"
            hidden
            onChange={(e) => handleImageChange(e)}
          />
        </label>
        {imagePreview && (
          <img
            src={typeof imagePreview === 'string' ? imagePreview : undefined}
            alt="Apercu de l'image"
            className="max-w-36 max-h-36 my-2 mx-auto"
          />
        )}

        <div className="mb-2 mt-4">
          <label
            htmlFor="description"
            className="block text-lg font-medium leading-6 text-primaryText"
          >
            Présentez-vous en quelques lignes
          </label>
        </div>
        <div className="mt-2">
          <div className="flex bg-white rounded-md shadow-sm border">
            <textarea
              name="description"
              id="description"
              cols={60}
              rows={7}
              maxLength={1000}
              placeholder="Écrivez votre description ici"
              className="block w-full border-0 bg-transparent py-1.5 p-2 text-primaryText placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={descriptionInputValue}
              onChange={handleDescriptionInputChange}
              required
            />
          </div>
        </div>

        {errorTo && (
          <div className="text-secondaryPink text-center flex justify-center mt-6">
            <p className="justify-self-center max-w-48">{errorTo}</p>
          </div>
        )}

        <div className="flex justify-center mt-6 mb-2">
          <DefaultBtn btnType="submit" btnText="Valider" />
        </div>
        <div className="step_paragraph text-primaryText text-center text-sm">
          <p>Étape 3/4: Photo de profil et description</p>
        </div>
        <div className="flex justify-center text-secondaryPink mt-1">
          <button type="button" onClick={onPreviousClick}>
            Revenir à l&#39;étape précédente
          </button>
        </div>
      </form>
    </div>
  );
}
