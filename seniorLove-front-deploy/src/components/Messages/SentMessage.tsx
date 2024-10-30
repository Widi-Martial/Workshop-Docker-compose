interface SentMessageProps {
  sentMessage: string;
  isView: boolean;
}

function SentMessage({ sentMessage, isView }: SentMessageProps) {
  return (
    <div>
      <div className=" mx-4 mt-4 flex justify-end items-end gap-2 md:w-2/3 ml-auto">
        <div className="p-2 md:p-4 bg-secondaryPink shadow-around rounded-3xl text-right">
          <p className="text-sm text-white">{sentMessage}</p>
        </div>
      </div>
      {isView && (
        <span className="text-xs block text-right font-bold text-gray-400 mr-5">
          Vu
        </span>
      )}
    </div>
  );
}

export default SentMessage;
