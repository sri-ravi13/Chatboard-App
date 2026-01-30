import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Users, Palette, Send, Plus, Search, X,
  Circle, Square, Minus, Type, Eraser, Download, Upload,
  Trash2, User, LogOut, Check, Clock, Wifi, Image, Video,
  FileText, Mic, MicOff, Play, Pause, ArrowRight, Eye,
  EyeOff, Copy, Layers, MousePointer, CheckSquare, Trash
} from 'lucide-react';

function App() {  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const [activeTab, setActiveTab] = useState('chat');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);


  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [activeChat, setActiveChat] = useState(null);


  const [whiteboards, setWhiteboards] = useState([{ id: 'default', name: 'Main Board', viewers: [] }]);
  const [activeWhiteboard, setActiveWhiteboard] = useState('default');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('cursor');
  const [color, setColor] = useState('#00ffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [elements, setElements] = useState({});
  const [textBoxes, setTextBoxes] = useState({});
  const [activeTextBox, setActiveTextBox] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [showViewerSettings, setShowViewerSettings] = useState(false);
  const [showBoardManager, setShowBoardManager] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');


  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);


  const [lastSync, setLastSync] = useState(Date.now());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connected');

  const canvasRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const getStorage = async (key, shared = false) => {
    try {

      if (!window.storage) throw new Error("Storage service is not initialized.");
      const result = await window.storage.get(key, shared);
      return result ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error("Storage GET Error:", error);
      return null;
    }
  };

  const setStorage = async (key, value, shared = false) => {
    try {
      if (!window.storage) throw new Error("Storage service is not initialized.");
      await window.storage.set(key, JSON.stringify(value), shared);
      return true;
    } catch (error) {
      console.error('Storage SET error:', error);
      return false;
    }
  };

  const deleteStorage = async (key, shared = false) => {
    try {
      if (!window.storage) throw new Error("Storage service is not initialized.");
      await window.storage.delete(key, shared);
      return true;
    } catch (error) {
      console.error('Storage DELETE error:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await getStorage('users', true);
        if (usersData) setUsers(usersData);

        const currentUserData = await getStorage('currentUser');
        if (currentUserData) {
          setCurrentUser(currentUserData);
          
          if (usersData) {
            const updatedUsers = usersData.map(u =>
              u.id === currentUserData.id ? { ...u, status: 'online', lastSeen: new Date().toISOString() } : u
            );
            setUsers(updatedUsers);
            await setStorage('users', updatedUsers, true);
          }
        }

        const convsData = await getStorage('conversations', true);
        if (convsData) setConversations(convsData);

        const boardsData = await getStorage('whiteboards', true);
        if (boardsData) setWhiteboards(boardsData);

        const elementsData = await getStorage('whiteboard-elements', true);
        if (elementsData) setElements(elementsData);

        const textBoxesData = await getStorage('whiteboard-textboxes', true);
        if (textBoxesData) setTextBoxes(textBoxesData);
      } catch (error) {
        console.log('Starting fresh - no existing data');
      }
    };


    setTimeout(loadData, 100);
  }, []);
  

  useEffect(() => {
    if (!currentUser || !window.storage?.onDataChange) return;

    console.log('🔥 Setting up Firebase real-time listeners...');


    const unsubscribeUsers = window.storage.onDataChange('users', true, (data) => {
      if (data) setUsers(data);
      setLastSync(Date.now());
    });


    const unsubscribeConversations = window.storage.onDataChange('conversations', true, (data) => {
      if (data) setConversations(data);
      setLastSync(Date.now());
    });


    const unsubscribeWhiteboards = window.storage.onDataChange('whiteboards', true, (data) => {
      if (data) setWhiteboards(data);
      setLastSync(Date.now());
    });


    const unsubscribeElements = window.storage.onDataChange('whiteboard-elements', true, (data) => {
      if (data) setElements(data);
      setLastSync(Date.now());
    });


    const unsubscribeTextBoxes = window.storage.onDataChange('whiteboard-textboxes', true, (data) => {
      if (data) setTextBoxes(data);
      setLastSync(Date.now());
    });

    setSyncStatus('connected');
    setIsSyncing(false);
    console.log('✅ Firebase listeners active!');


    return () => {
      console.log('🔌 Cleaning up listeners...');
      unsubscribeUsers?.();
      unsubscribeConversations?.();
      unsubscribeWhiteboards?.();
      unsubscribeElements?.();
      unsubscribeTextBoxes?.();
    };
  }, [currentUser]);

  const handleAuth = async () => {
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }

    let allUsers = await getStorage('users', true) || [];

    if (authMode === 'signup') {
      const existingUser = allUsers.find(u => u.username === username);
      if (existingUser) {
        alert('Username already exists');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: 'online',
        lastSeen: new Date().toISOString()
      };

      const updatedUsers = [...allUsers, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      await setStorage('users', updatedUsers, true);
      await setStorage('currentUser', newUser);

    } else {
      const user = allUsers.find(u => u.username === username && u.password === password);
      if (!user) {
        alert('Invalid credentials');
        return;
      }

      const updatedUser = { ...user, status: 'online', lastSeen: new Date().toISOString() };
      const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      await setStorage('users', updatedUsers, true);
      await setStorage('currentUser', updatedUser);
    }

    setUsername('');
    setPassword('');
  };

  const handleLogout = async () => {
    if (currentUser) {
      const updatedUsers = users.map(u =>
        u.id === currentUser.id
          ? { ...u, status: 'offline', lastSeen: new Date().toISOString() }
          : u
      );
      setUsers(updatedUsers);
      await setStorage('users', updatedUsers, true);
    }
    setCurrentUser(null);
    await deleteStorage('currentUser');
    setActiveChat(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const newMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: activeChat.id,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
        fileName: file.name,
        fileData: event.target.result,
        fileSize: file.size,
        timestamp: new Date().toISOString(),
        read: false
      };

      const chatKey = [currentUser.id, activeChat.id].sort().join('-');
      const updatedConvs = {
        ...conversations,
        [chatKey]: [...(conversations[chatKey] || []), newMessage]
      };

      setConversations(updatedConvs);
      await setStorage('conversations', updatedConvs, true);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          const newMessage = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            receiverId: activeChat.id,
            type: 'voice',
            voiceData: event.target.result,
            timestamp: new Date().toISOString(),
            read: false
          };

          const chatKey = [currentUser.id, activeChat.id].sort().join('-');
          const updatedConvs = {
            ...conversations,
            [chatKey]: [...(conversations[chatKey] || []), newMessage]
          };

          setConversations(updatedConvs);
          await setStorage('conversations', updatedConvs, true);
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playVoiceMessage = (messageId, voiceData) => {
    if (playingAudio === messageId) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(voiceData);
    audio.play();
    setPlayingAudio(messageId);
    audio.onended = () => setPlayingAudio(null);
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeChat.id,
      type: 'text',
      text: message,
      timestamp: new Date().toISOString(),
      read: false
    };

    const chatKey = [currentUser.id, activeChat.id].sort().join('-');
    const updatedConvs = {
      ...conversations,
      [chatKey]: [...(conversations[chatKey] || []), newMessage]
    };

    setConversations(updatedConvs);
    setMessage('');
    await setStorage('conversations', updatedConvs, true);
  };

  const deleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedMessages.length} message(s)?`)) return;

    const chatKey = [currentUser.id, activeChat.id].sort().join('-');
    const chatMessages = conversations[chatKey] || [];
    
    const updatedMessages = chatMessages.filter(msg => !selectedMessages.includes(msg.id));
    
    const updatedConvs = {
      ...conversations,
      [chatKey]: updatedMessages
    };

    setConversations(updatedConvs);
    await setStorage('conversations', updatedConvs, true);
    setSelectedMessages([]);
    setSelectionMode(false);
  };

  const selectAllMessages = () => {
    const chatKey = [currentUser.id, activeChat.id].sort().join('-');
    const chatMessages = conversations[chatKey] || [];
    setSelectedMessages(chatMessages.map(msg => msg.id));
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const markMessagesAsRead = async (userId) => {
    const chatKey = [currentUser.id, userId].sort().join('-');
    const chatMessages = conversations[chatKey] || [];

    const updatedMessages = chatMessages.map(msg =>
      msg.receiverId === currentUser.id ? { ...msg, read: true } : msg
    );

    const updatedConvs = {
      ...conversations,
      [chatKey]: updatedMessages
    };

    setConversations(updatedConvs);
    await setStorage('conversations', updatedConvs, true);
  };

  const getUnreadCount = (userId) => {
    const chatKey = [currentUser.id, userId].sort().join('-');
    const chatMessages = conversations[chatKey] || [];
    return chatMessages.filter(msg => msg.receiverId === currentUser.id && !msg.read).length;
  };




  const createWhiteboard = async () => {
    if (!newBoardName.trim()) return;

    const newBoard = {
      id: Date.now().toString(),
      name: newBoardName,
      viewers: [],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const updatedBoards = [...whiteboards, newBoard];
    setWhiteboards(updatedBoards);
    await setStorage('whiteboards', updatedBoards, true);
    setNewBoardName('');
    setActiveWhiteboard(newBoard.id);
  };

  const deleteWhiteboard = async (boardId) => {
    if (boardId === 'default') {
      alert('Cannot delete the main board');
      return;
    }

    if (!window.confirm('Delete this whiteboard?')) return;

    const updatedBoards = whiteboards.filter(b => b.id !== boardId);
    setWhiteboards(updatedBoards);
    await setStorage('whiteboards', updatedBoards, true);

    const updatedElements = { ...elements };
    delete updatedElements[boardId];
    setElements(updatedElements);
    await setStorage('whiteboard-elements', updatedElements, true);

    const updatedTextBoxes = { ...textBoxes };
    delete updatedTextBoxes[boardId];
    setTextBoxes(updatedTextBoxes);
    await setStorage('whiteboard-textboxes', updatedTextBoxes, true);

    setActiveWhiteboard('default');
  };

  const updateViewers = async (boardId, userIds) => {
    const updatedBoards = whiteboards.map(b =>
      b.id === boardId ? { ...b, viewers: userIds } : b
    );
    setWhiteboards(updatedBoards);
    await setStorage('whiteboards', updatedBoards, true);
  };

  const canViewBoard = (board) => {
    if (board.viewers.length === 0) return true;
    return board.viewers.includes(currentUser.id);
  };




  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'cursor') return;

    if (tool === 'text') {
      const newTextBox = {
        id: Date.now().toString(),
        x,
        y,
        text: '',
        color,
        fontSize,
        width: 200,
        height: 100,
        author: currentUser.username,
        timestamp: Date.now()
      };

      const boardElements = textBoxes[activeWhiteboard] || [];
      const updatedTextBoxes = {
        ...textBoxes,
        [activeWhiteboard]: [...boardElements, newTextBox]
      };
      
      setTextBoxes(updatedTextBoxes);
      setActiveTextBox(newTextBox.id);
      setStorage('whiteboard-textboxes', updatedTextBoxes, true);
      
      setTimeout(() => setTool('cursor'), 100);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === 'pen' || tool === 'eraser') {
      const newElement = {
        id: Date.now().toString(),
        tool,
        color: tool === 'eraser' ? '#1a1a2e' : color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth,
        points: [{ x, y }],
        author: currentUser.username,
        timestamp: Date.now()
      };
      
      const boardElements = elements[activeWhiteboard] || [];
      setElements({
        ...elements,
        [activeWhiteboard]: [...boardElements, newElement]
      });
      setCurrentPath([{ x, y }]);
    }
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'cursor') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pen' || tool === 'eraser') {
      setElements(prev => {
        const newElements = { ...prev };
        const boardElements = newElements[activeWhiteboard] || [];
        const currentElement = boardElements[boardElements.length - 1];
        if (currentElement) {
          currentElement.points.push({ x, y });
        }
        return newElements;
      });

      setCurrentPath(prev => [...prev, { x, y }]);
    }
  };

  const stopDrawing = async (e) => {
    if (!isDrawing || tool === 'cursor') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'circle' || tool === 'rectangle' || tool === 'line' || tool === 'arrow') {
      const newElement = {
        id: Date.now().toString(),
        tool,
        color,
        lineWidth,
        startPos,
        endPos: { x, y },
        author: currentUser.username,
        timestamp: Date.now()
      };
      
      const boardElements = elements[activeWhiteboard] || [];
      const updatedElements = {
        ...elements,
        [activeWhiteboard]: [...boardElements, newElement]
      };
      setElements(updatedElements);
      await setStorage('whiteboard-elements', updatedElements, true);
    } else if (tool === 'pen' || tool === 'eraser') {
      await setStorage('whiteboard-elements', elements, true);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentPath([]);
  };

  const clearCanvas = async () => {
    if (!window.confirm('Clear this whiteboard? This will affect all users.')) return;
    
    const updatedElements = { ...elements, [activeWhiteboard]: [] };
    const updatedTextBoxes = { ...textBoxes, [activeWhiteboard]: [] };
    
    setElements(updatedElements);
    setTextBoxes(updatedTextBoxes);
    await setStorage('whiteboard-elements', updatedElements, true);
    await setStorage('whiteboard-textboxes', updatedTextBoxes, true);
  };

  const updateTextBox = async (id, updates) => {
    const boardTextBoxes = textBoxes[activeWhiteboard] || [];
    const updatedBoxes = boardTextBoxes.map(tb =>
      tb.id === id ? { ...tb, ...updates, lastEditedBy: currentUser.username, lastEditedAt: Date.now() } : tb
    );
    
    const updatedTextBoxes = {
      ...textBoxes,
      [activeWhiteboard]: updatedBoxes
    };
    
    setTextBoxes(updatedTextBoxes);
    await setStorage('whiteboard-textboxes', updatedTextBoxes, true);
  };

  const deleteTextBox = async (id) => {
    const boardTextBoxes = textBoxes[activeWhiteboard] || [];
    const updatedBoxes = boardTextBoxes.filter(tb => tb.id !== id);
    
    const updatedTextBoxes = {
      ...textBoxes,
      [activeWhiteboard]: updatedBoxes
    };
    
    setTextBoxes(updatedTextBoxes);
    setActiveTextBox(null);
    await setStorage('whiteboard-textboxes', updatedTextBoxes, true);
  };




  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boardElements = elements[activeWhiteboard] || [];
    
    boardElements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.tool === 'pen' || element.tool === 'eraser') {
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (element.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(element.startPos.x, element.startPos.y);
        ctx.lineTo(element.endPos.x, element.endPos.y);
        ctx.stroke();
      } else if (element.tool === 'arrow') {
        const headlen = 15;
        const angle = Math.atan2(element.endPos.y - element.startPos.y, element.endPos.x - element.startPos.x);
        
        ctx.beginPath();
        ctx.moveTo(element.startPos.x, element.startPos.y);
        ctx.lineTo(element.endPos.x, element.endPos.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(element.endPos.x, element.endPos.y);
        ctx.lineTo(element.endPos.x - headlen * Math.cos(angle - Math.PI / 6), element.endPos.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(element.endPos.x - headlen * Math.cos(angle + Math.PI / 6), element.endPos.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(element.endPos.x, element.endPos.y);
        ctx.fillStyle = element.color;
        ctx.fill();
      } else if (element.tool === 'rectangle') {
        ctx.strokeRect(
          element.startPos.x,
          element.startPos.y,
          element.endPos.x - element.startPos.x,
          element.endPos.y - element.startPos.y
        );
      } else if (element.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(element.endPos.x - element.startPos.x, 2) +
          Math.pow(element.endPos.y - element.startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(element.startPos.x, element.startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [elements, activeWhiteboard]);




  if (!currentUser) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-purple-900 rounded-full mb-4">
              <MessageCircle className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">ChatBoard Pro</h1>
            <p className="text-gray-400 mt-2">Message, Share & Create Together</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  const filteredUsers = users.filter(u =>
    u.id !== currentUser.id &&
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatKey = activeChat ? [currentUser.id, activeChat.id].sort().join('-') : null;
  const chatMessages = chatKey ? (conversations[chatKey] || []) : [];

  const currentBoard = whiteboards.find(b => b.id === activeWhiteboard);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ChatBoard Pro
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'whiteboard'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Palette className="w-5 h-5 inline mr-2" />
              Whiteboard
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <img src={currentUser.avatar} alt={currentUser.username} className="w-8 h-8 rounded-full" />
              <span className="font-medium text-white">{currentUser.username}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'chat' ? (
          <>
            {/* Sidebar */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${syncStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-gray-400">
                      {syncStatus === 'connected' ? 'Live Sync' : 'Reconnecting...'}
                    </span>
                  </div>
                  {isSyncing && <Clock className="w-3 h-3 text-gray-500 animate-spin" />}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map(user => {
                  const unreadCount = getUnreadCount(user.id);
                  const chatKey = [currentUser.id, user.id].sort().join('-');
                  const userMessages = conversations[chatKey] || [];
                  const lastMessage = userMessages[userMessages.length - 1];

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setActiveChat(user);
                        markMessagesAsRead(user.id);
                        setSelectionMode(false);
                        setSelectedMessages([]);
                      }}
                      className={`p-4 border-b border-gray-700 cursor-pointer transition ${
                        activeChat?.id === user.id ? 'bg-gray-700' : 'hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full" />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">{user.username}</h3>
                            {unreadCount > 0 && (
                              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-gray-400 truncate">
                              {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                              {lastMessage.type === 'text' ? lastMessage.text : 
                               lastMessage.type === 'image' ? '📷 Photo' :
                               lastMessage.type === 'video' ? '🎥 Video' :
                               lastMessage.type === 'voice' ? '🎤 Voice message' : '📎 File'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-900">
              {activeChat ? (
                <>
                  <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={activeChat.avatar} alt={activeChat.username} className="w-10 h-10 rounded-full" />
                      <div>
                        <h2 className="font-medium text-white">{activeChat.username}</h2>
                        <p className="text-sm text-gray-400">
                          {activeChat.status === 'online' ? 'Active now' : `Last seen ${new Date(activeChat.lastSeen).toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    {chatMessages.length > 0 && (
                      <div className="flex gap-2">
                        {!selectionMode ? (
                          <button
                            onClick={() => setSelectionMode(true)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Select
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={selectAllMessages}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                              <CheckSquare className="w-4 h-4" />
                              Select All
                            </button>
                            <button
                              onClick={deleteMessages}
                              disabled={selectedMessages.length === 0}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash className="w-4 h-4" />
                              Delete ({selectedMessages.length})
                            </button>
                            <button
                              onClick={() => {
                                setSelectionMode(false);
                                setSelectedMessages([]);
                              }}
                              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map(msg => {
                      const isSent = msg.senderId === currentUser.id;
                      const isSelected = selectedMessages.includes(msg.id);
                      
                      return (
                        <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex items-start gap-2">
                            {selectionMode && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleMessageSelection(msg.id)}
                                className="mt-2 w-5 h-5 cursor-pointer"
                              />
                            )}
                            <div className={`max-w-md ${isSent ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-gray-800 text-white'} rounded-2xl px-4 py-2 shadow-lg ${isSelected ? 'ring-2 ring-yellow-500' : ''}`}>
                              {msg.type === 'text' && <p>{msg.text}</p>}
                              
                              {msg.type === 'image' && (
                                <div>
                                  <img src={msg.fileData} alt={msg.fileName} className="max-w-xs rounded-lg" />
                                  <p className="text-xs mt-1 opacity-70">{msg.fileName}</p>
                                </div>
                              )}
                              
                              {msg.type === 'video' && (
                                <div>
                                  <video src={msg.fileData} controls className="max-w-xs rounded-lg" />
                                  <p className="text-xs mt-1 opacity-70">{msg.fileName}</p>
                                </div>
                              )}
                              
                              {msg.type === 'file' && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-8 h-8" />
                                  <div>
                                    <p className="font-medium">{msg.fileName}</p>
                                    <p className="text-xs opacity-70">{(msg.fileSize / 1024).toFixed(2)} KB</p>
                                  </div>
                                  <a href={msg.fileData} download={msg.fileName} className="ml-2 p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30">
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                              
                              {msg.type === 'voice' && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => playVoiceMessage(msg.id, msg.voiceData)}
                                    className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
                                  >
                                    {playingAudio === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </button>
                                  <div className="flex-1">
                                    <div className="h-1 bg-white bg-opacity-30 rounded-full">
                                      <div className="h-1 bg-white rounded-full w-0"></div>
                                    </div>
                                  </div>
                                  <Mic className="w-4 h-4" />
                                </div>
                              )}
                              
                              <div className={`flex items-center gap-1 mt-1 text-xs ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isSent && msg.read && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
                    <div className="flex gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition"
                        title="Attach file"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-full transition ${
                          isRecording 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={isRecording ? 'Stop recording' : 'Voice message'}
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isRecording}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 disabled:opacity-50"
                      />
                      
                      <button
                        onClick={sendMessage}
                        disabled={isRecording}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-400">Select a chat to start messaging</h3>
                    <p className="text-sm text-gray-500 mt-2">Share messages, files, images, videos, and voice notes</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Whiteboard */
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTool('cursor')}
                  className={`p-2 rounded-lg transition ${tool === 'cursor' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Cursor (Select)"
                >
                  <MousePointer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('pen')}
                  className={`p-2 rounded-lg transition ${tool === 'pen' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Pen"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-lg transition ${tool === 'eraser' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Eraser"
                >
                  <Eraser className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('line')}
                  className={`p-2 rounded-lg transition ${tool === 'line' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Line"
                >
                  <Minus className="w-5 h-5 rotate-45" />
                </button>
                <button
                  onClick={() => setTool('arrow')}
                  className={`p-2 rounded-lg transition ${tool === 'arrow' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Arrow"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('rectangle')}
                  className={`p-2 rounded-lg transition ${tool === 'rectangle' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Rectangle"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('circle')}
                  className={`p-2 rounded-lg transition ${tool === 'circle' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Circle"
                >
                  <Circle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('text')}
                  className={`p-2 rounded-lg transition ${tool === 'text' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`}
                  title="Text Box"
                >
                  <Type className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-l border-gray-600 pl-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-gray-700"
                    title="Color"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-300 w-10">{lineWidth}px</span>
                  </div>
                  {tool === 'text' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-300 w-10">{fontSize}px</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoardManager(!showBoardManager)}
                  className="p-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  title="Manage Boards"
                >
                  <Layers className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowViewerSettings(!showViewerSettings)}
                  className="p-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  title="Viewer Settings"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 text-red-400 bg-gray-700 hover:bg-red-900 rounded-lg transition"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Board Manager Modal */}
            {showBoardManager && (
              <div className="absolute top-20 right-6 bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border border-gray-700 w-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Whiteboards
                  </h3>
                  <button onClick={() => setShowBoardManager(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {whiteboards.map(board => (
                    <div
                      key={board.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                        activeWhiteboard === board.id ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        if (canViewBoard(board)) {
                          setActiveWhiteboard(board.id);
                        } else {
                          alert('You do not have permission to view this board');
                        }
                      }}
                    >
                      <span className="text-white">{board.name}</span>
                      <div className="flex items-center gap-2">
                        {!canViewBoard(board) && <EyeOff className="w-4 h-4 text-red-400" />}
                        {board.id !== 'default' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWhiteboard(board.id);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New board name..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createWhiteboard()}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={createWhiteboard}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Viewer Settings Modal */}
            {showViewerSettings && currentBoard && (
              <div className="absolute top-20 right-6 bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border border-gray-700 w-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Who can view "{currentBoard.name}"
                  </h3>
                  <button onClick={() => setShowViewerSettings(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  {currentBoard.viewers.length === 0 ? 'Everyone can view this board' : `${currentBoard.viewers.length} user(s) selected`}
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentBoard.viewers.includes(user.id)}
                        onChange={(e) => {
                          const newViewers = e.target.checked
                            ? [...currentBoard.viewers, user.id]
                            : currentBoard.viewers.filter(id => id !== user.id);
                          updateViewers(currentBoard.id, newViewers);
                        }}
                        className="w-4 h-4"
                      />
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                      <span className="text-white">{user.username}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => updateViewers(currentBoard.id, [])}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Allow Everyone
                </button>
              </div>
            )}

            <div className="flex-1 flex items-center justify-center p-6 bg-gray-900 relative">
              {/* Live Collaboration Badge */}
              <div className="absolute top-4 right-4 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-300 font-medium">Live Sync</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Board: {currentBoard?.name}</p>
              </div>

              {/* Active Users Indicator */}
              <div className="absolute top-4 left-4 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">
                    {users.filter(u => u.status === 'online').length} online
                  </span>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-700 ${
                  tool === 'cursor' ? 'cursor-default' : 'cursor-crosshair'
                }`}
              />

              {/* Text Boxes Overlay */}
              {(textBoxes[activeWhiteboard] || []).map(tb => (
                <div
                  key={tb.id}
                  style={{
                    position: 'absolute',
                    left: `calc(50% - 600px + ${tb.x}px)`,
                    top: `calc(50% - 350px + ${tb.y}px)`,
                    width: `${tb.width}px`,
                    minHeight: `${tb.height}px`
                  }}
                  className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-600"
                >
                  {activeTextBox === tb.id ? (
                    <div className="p-2">
                      <textarea
                        value={tb.text}
                        onChange={(e) => updateTextBox(tb.id, { text: e.target.value })}
                        onBlur={() => setActiveTextBox(null)}
                        autoFocus
                        className="w-full bg-transparent border-none focus:outline-none text-white resize-none"
                        style={{ fontSize: `${tb.fontSize}px`, color: tb.color, minHeight: '80px' }}
                        placeholder="Type your text here..."
                      />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                        <div className="flex gap-2">
                          <input
                            type="range"
                            min="100"
                            max="500"
                            value={tb.width}
                            onChange={(e) => updateTextBox(tb.id, { width: Number(e.target.value) })}
                            className="w-20"
                            title="Width"
                          />
                          <input
                            type="range"
                            min="50"
                            max="300"
                            value={tb.height}
                            onChange={(e) => updateTextBox(tb.id, { height: Number(e.target.value) })}
                            className="w-20"
                            title="Height"
                          />
                        </div>
                        <button
                          onClick={() => deleteTextBox(tb.id)}
                          className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative p-2">
                      <div
                        onClick={() => tool === 'cursor' && setActiveTextBox(tb.id)}
                        className="cursor-pointer hover:opacity-80 whitespace-pre-wrap break-words"
                        style={{ fontSize: `${tb.fontSize}px`, color: tb.color }}
                      >
                        {tb.text || 'Click to edit...'}
                      </div>
                      {tb.author && (
                        <span className="absolute -top-5 left-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition bg-gray-900 px-2 py-1 rounded">
                          by {tb.author}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;