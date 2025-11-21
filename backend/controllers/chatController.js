import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', 'fullName email role') // Get user info
        .sort({ updatedAt: -1 }); // Newest first

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error getting conversations:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
export const getMessages = async (req, res) => {
    try {
        // Verify user is a participant in this conversation
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const userId = req.user._id.toString();
        const isParticipant = conversation.participants.some(p => {
            const participantId = typeof p === 'object' ? p._id.toString() : p.toString();
            return participantId === userId;
        });
        
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        .populate('sender', 'fullName email') // Populate sender info
        .sort({ createdAt: 1 }); // Oldest first (chronological order)

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message (Handles creation of new convos too)
// @route   POST /api/chat/message
export const sendMessage = async (req, res) => {
    // Debug Logs
    console.log("--- SEND MESSAGE HIT ---");
    console.log("Sender ID:", req.user._id);
    console.log("Payload:", req.body);

    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    try {
        let conversation;

        // SCENARIO 1: We have a conversation ID (replying to existing)
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        } 
        
        // SCENARIO 2: No ID provided, check if conversation exists in DB
        else if (recipientId) {
            conversation = await Conversation.findOne({
                participants: { $all: [senderId, recipientId] }
            });

            // SCENARIO 3: Totally new chat -> Create it
            if (!conversation) {
                console.log("Creating new conversation...");
                conversation = await Conversation.create({
                    participants: [senderId, recipientId],
                    lastMessage: content
                });
            }
        }

        if (!conversation) {
            return res.status(400).json({ message: "Could not establish conversation" });
        }

        // Create the message
        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            content: content
        });

        await newMessage.save();

        // Populate sender info before returning
        await newMessage.populate('sender', 'fullName email');

        // Update the sidebar preview
        await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: content,
            updatedAt: Date.now()
        });

        console.log("Message sent successfully");

        // Return the message AND the conversation ID
        res.status(200).json({ message: newMessage, conversationId: conversation._id });
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        res.status(500).json(error);
    }
};