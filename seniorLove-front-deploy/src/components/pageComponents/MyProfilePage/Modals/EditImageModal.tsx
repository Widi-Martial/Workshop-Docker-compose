/* eslint-disable jsx-a11y/label-has-associated-control */
import ReactModal from 'react-modal';
import { useState } from 'react';
import { IUsers } from '../../../../@types/IUsers';
import DefaultBtn from '../../../standaloneComponents/Button/DefaultBtn';
import { updateDataInLocalStorage } from '../../../../localStorage/localStorage';
import axios from '../../../../axios';

interface EditImageModalProps {
  isImageModalOpen: boolean;
  setIsImageModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: IUsers;
  setEditedProfile: React.Dispatch<React.SetStateAction<Partial<IUsers>>>;
  setModifiedPhotoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPhotoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setUpdateFunction: React.Dispatch<React.SetStateAction<() => void>>;
}

export default function EditImageModal({
  isImageModalOpen,
  setIsImageModalOpen,
  user,
  setEditedProfile,
  setModifiedPhotoUrl,
  setIsPhotoLoading,
  previewUrl,
  setPreviewUrl,
  setUpdateFunction,
}: EditImageModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
    }
    // Create a preview of the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };

    if (file) {
      reader.readAsDataURL(file as Blob);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    setIsPhotoLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('new-image', selectedFile);

    try {
      const response = await axios.post(
        `/private/users/${user.id}/uploadPhoto`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;
      if (response.status === 200) {
        setEditedProfile((prev) => ({ ...prev, picture: result.pictureUrl }));
        setEditedProfile((prev) => ({ ...prev, picture_id: result.pictureId }));
        updateDataInLocalStorage(result.pictureUrl, '');
        setIsImageModalOpen(false); // Close modal after success
      } else {
        setError(result.error || 'Image upload failed');
      }
    } catch (err) {
      setError('Error uploading image');
      console.error('Error uploading image:', error);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const validateImage = () => {
    setModifiedPhotoUrl(previewUrl);
    setPreviewUrl(null);
    setUpdateFunction(() => handleImageUpload);
    setIsImageModalOpen(false);
  };

  return (
    <ReactModal
      isOpen={isImageModalOpen}
      onRequestClose={() => setIsImageModalOpen(false)}
      style={{
        content: {
          width: '80vw',
          height: 'fit-content',
          maxWidth: '500px',
          margin: 'auto',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)' /* Customize overlay color */,
        },
      }}
    >
      <h3 className="text-xl text-center font-semibold text-secondaryPink">
        Changez votre image
      </h3>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <img
              src={user.picture} // Replace with actual image path
              alt={user.name}
              className="w-1/2 object-cover rounded-md border border-gray-300"
            />
            <p className="mt-2 text-gray-600">Ancienne photo</p>
          </div>

          <div className="flex flex-col items-center">
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
                  Charger une nouvelle photo
                </h4>
              </div>
              <input
                type="file"
                id="doc"
                name="doc"
                accept="png, jpg"
                hidden
                onChange={handleFileChange}
              />
            </label>
            {previewUrl && (
              <>
                <p className="mt-2 text-gray-600">Nouvelle photo</p>
                <img
                  src={previewUrl}
                  alt={user.name}
                  className="w-1/2 object-cover rounded-md shadow border border-gray-300"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex">
          <DefaultBtn
            btnText="Valider"
            btnValidate
            btnModalPicture
            onClick={() => validateImage()}
          />
        </div>
      </div>
    </ReactModal>
  );
}
