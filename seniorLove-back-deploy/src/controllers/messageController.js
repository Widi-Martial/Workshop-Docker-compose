import { User_message, User } from '../models/index.js';
import Joi from 'joi';
import { Op } from 'sequelize';
import { isActiveUser } from '../utils/checkUserStatus.js';

// Récupere tous les messages d'un utilisateur connecté
export async function getAllUserMessages(req, res) {
  // Get my id, and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Get in DB all messages that have my id as sender OR receiver
  const myMessages = await User_message.findAll({
    where: { [Op.or]: [{ sender_id: myId }, { receiver_id: myId }] },
    attributes: { exclude: 'updated_at' },
    include: [
      { association: 'sender', attributes: ['id', 'name', 'picture'] },
      { association: 'receiver', attributes: ['id', 'name', 'picture'] },
    ],
  });

  // Send data. If none, an empty array will be sent
  res.status(200).json(myMessages);
}

// Retrieve all the members the user has chatted with
export async function getAllUserContacts(req, res) {
  // Get my id and check if i'm active
  const myId = parseInt(req.user.userId, 10);
  const me = await User.findByPk(myId);
  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }

  // Get in DB all users that have received messages sent by me, or that have sent messages received by me
  const myContacts = await User.findAll({
    include: [
      {
        model: User_message,
        as: 'received_messages',
        // order: [['created_at', 'DESC']],
        where: { sender_id: myId },
        required: false,
        attributes: { exclude: ['updated_at'] },
        include: {
          association: 'sender',
          attributes: ['id', 'name', 'picture'],
        },
      },
      {
        model: User_message,
        as: 'sent_messages',
        // order: [['created_at', 'DESC']],
        where: { receiver_id: myId },
        required: false,
        attributes: { exclude: ['updated_at'] },
        include: {
          association: 'sender',
          attributes: ['id', 'name', 'picture'],
        },
      },
    ],
    attributes: ['id', 'name', 'picture'],
    where: {
      [Op.or]: [
        { '$received_messages.id$': { [Op.ne]: null } }, // Users who received messages from you
        { '$sent_messages.id$': { [Op.ne]: null } }, // Users you sent messages to
      ],
    },
    order: [
      [{ model: User_message, as: 'received_messages' }, 'created_at', 'DESC'],
      [{ model: User_message, as: 'sent_messages' }, 'created_at', 'DESC'],
    ],
  });
  // Send the result as is, if it's an empty array (no match)
  if (!myContacts.length) {
    return res.status(200).json(myContacts);
  }

  // Else prepare a new array with an object template with necessary data to be sent, and sort messages by created_at
  const formattedContacts = [];

  myContacts.forEach((converser) => {
    const converserObject = {
      id: converser.id,
      name: converser.name,
      picture: converser.picture,
      messages: [
        ...converser.received_messages,
        ...converser.sent_messages,
      ].sort((a, b) => a.created_at - b.created_at),
    };
    formattedContacts.push(converserObject);
  });

  res.status(200).json(formattedContacts);
}

//Send a message to a user
export async function sendMessageToUser(req, res) {
  // Get User id and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Check if user exist and if not banned or pending
  const me = await User.findByPk(myId);
  // if check above fail return status with json value (true) to the client
  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }

  // Convert string in number before Joi check
  req.body.receiver_id = parseInt(req.body.receiver_id, 10);

  // Build a Joi schema to check data in body
  const messageSchema = Joi.object({
    message: Joi.string().required(),
    receiver_id: Joi.number().integer().min(1).invalid(myId).required(),
  });

  // check if error in validate schema with req.body
  const { error } = messageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Once body is ok, extract message and receiver_id and check receiver user
  const { message, receiver_id } = req.body;

  // check if the receiver is not banned
  if (!(await isActiveUser(req.body.receiver_id))) {
    return res.status(403).json({ message: 'Receiver not found' });
  }
  // all it's ok so we insert the message in DataBase by including senderId and receiverId
  const messageSent = await User_message.create({
    message,
    sender_id: myId,
    receiver_id,
  });

  // return status with message sending
  res.status(201).json(messageSent);
}

//Pass a message as read
export async function putToReadMessage(req, res) {
  // Get my id and check if i'm active
  const myId = parseInt(req.user.userId, 10);
  const me = await User.findByPk(myId);
  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }

  // create Joi schema to validate the req.body
  const readSchema = Joi.number().integer().min(1).invalid(myId).required();

  // check req.body with Joi schema and return status if error
  const { error } = readSchema.validate(req.body.contactId);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // destructurin the req.body to get contactId and convert it to number
  let { contactId } = req.body;
  contactId = parseInt(contactId, 10);

  // update the table user_message : pass read to true
  await User_message.update(
    { read: true },
    { where: { receiver_id: myId, sender_id: contactId } }
  );

  // return status and a json with value 'true' for the client
  res.status(200).json({ reading: true });
}
