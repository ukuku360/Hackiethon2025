import React, { useState, useEffect } from 'react';

const NotePad = ({ activity, mainIdeas: initialMainIdeas, title, onSave, onClose }) => {
  const [noteContent, setNoteContent] = useState(activity || '');
  const [mainIdeas, setMainIdeas] = useState(initialMainIdeas || '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Function to check if Ollama is running
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  
  // Function to generate detailed notes using Ollama
  const generateDetailedNotes = async () => {
    if (!mainIdeas.trim()) {
      alert("Please enter some main ideas first");
      return;
    }
    
    // Check if Ollama is running
    const isRunning = await checkOllamaStatus();
    if (!isRunning) {
      alert("Ollama is not running. Please start Ollama first.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Extract hashtags from title if any
      const titleTags = (title.match(/#\w+/g) || []).join(' ');
      
      // Create a rich prompt for Ollama
      const promptText = `
      I want you to expand these brief notes into a detailed document.
      
      Title: ${title}
      Tags: ${titleTags}
      Main ideas:
      ${mainIdeas}
      
      Create detailed notes that:
      1. Expand on each main idea with supporting details and examples
      2. Use markdown formatting with headers for organization
      3. Connect related concepts where appropriate
      4. Include actionable items or key takeaways as bullet points
      5. Keep the writing style professional but conversational
      `;
      
      // Make request to local Ollama service
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: promptText,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setNoteContent(data.response);
    } catch (error) {
      console.error("Error generating notes:", error);
      alert("Failed to generate notes. Make sure Ollama is running with llama3.2 model.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-2xl max-h-3/4 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title || 'Untitled Activity'}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Main Ideas</label>
            <button 
              onClick={generateDetailedNotes}
              disabled={isGenerating}
              className={`px-3 py-1 text-xs rounded ${isGenerating ? 
                'bg-gray-300 cursor-not-allowed' : 
                'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isGenerating ? 'Generating...' : 'Generate with Ollama'}
            </button>
          </div>
          <textarea
            className="p-2 w-full border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={mainIdeas}
            onChange={(e) => setMainIdeas(e.target.value)}
            placeholder="Summarize your key points here..."
            rows={3}
          />
        </div>
        
        <div className="p-4 flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Notes</label>
          <textarea
            className="p-2 h-full w-full border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={isGenerating ? "Generating detailed notes with Ollama..." : "Write detailed notes about this activity..."}
            rows={8}
            disabled={isGenerating}
          />
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => onSave({ mainIdeas, detailedNotes: noteContent })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

const AllNotesView = ({ notes, activities, timestamps, hashtags, onClose }) => {
  const [filterTag, setFilterTag] = useState('');
  
  // Get all unique tags
  const allTags = new Set();
  Object.entries(hashtags).forEach(([key, value]) => {
    if (value) {
      const tags = value.split(/\s+/).filter(tag => tag.startsWith('#'));
      tags.forEach(tag => allTags.add(tag));
    }
  });
  
  // Group notes by tag
  const notesByTag = {};
  Array.from(allTags).forEach(tag => {
    notesByTag[tag] = [];
  });
  
  // Add "Untagged" category
  notesByTag["#untagged"] = [];
  
  // Populate the notes into their respective tag groups
  Object.entries(notes).forEach(([index, noteData]) => {
    const idx = parseInt(index);
    if (isNaN(idx) || !timestamps[idx]) return;
    
    const timestamp = timestamps[idx];
    const tags = hashtags[idx] ? hashtags[idx].split(/\s+/).filter(tag => tag.startsWith('#')) : [];
    
    if (tags.length === 0) {
      // If no tags, add to untagged
      notesByTag["#untagged"].push({
        id: idx,
        timestamp,
        title: activities[idx] || 'Untitled',
        noteData
      });
    } else {
      // Add to each relevant tag category
      tags.forEach(tag => {
        if (notesByTag[tag]) {
          notesByTag[tag].push({
            id: idx,
            timestamp,
            title: activities[idx] || 'Untitled',
            noteData
          });
        }
      });
    }
  });
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const time = timestamp.time;
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours || 12; // if hours == 0, set to 12
    
    const strHours = hours.toString().padStart(2, '0');
    const strMinutes = minutes.toString().padStart(2, '0');
    
    return `${strHours}:${strMinutes} ${amPm}`;
  };
  
  // Filter displayed tags based on search
  const displayTags = filterTag 
    ? Object.keys(notesByTag).filter(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
    : Object.keys(notesByTag);
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Notes</h2>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter by tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        
        {displayTags.map(tag => {
          const tagNotes = notesByTag[tag];
          if (tagNotes.length === 0) return null;
          
          return (
            <div key={tag} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                {tag === "#untagged" ? "Untagged Notes" : tag}
                <span className="ml-2 text-sm text-gray-500">({tagNotes.length})</span>
              </h3>
              
              <div className="space-y-4">
                {tagNotes.map(note => (
                  <div key={note.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{note.title}</h4>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(note.timestamp)} • {note.timestamp.elapsedTime < 60 
                          ? `${note.timestamp.elapsedTime}s` 
                          : `${Math.floor(note.timestamp.elapsedTime/60)}m ${note.timestamp.elapsedTime%60}s`}
                      </span>
                    </div>
                    
                    {note.noteData.mainIdeas && (
                      <div className="mb-2 text-sm bg-blue-50 p-2 rounded">
                        <div className="font-medium mb-1">Main Ideas:</div>
                        <p className="whitespace-pre-line">{note.noteData.mainIdeas}</p>
                      </div>
                    )}
                    
                    {note.noteData.detailedNotes && (
                      <div className="text-sm text-gray-700">
                        <div className="font-medium mb-1">Details:</div>
                        <p className="whitespace-pre-line">{note.noteData.detailedNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.values(notesByTag).every(notes => notes.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No notes found. Double-click on any activity to add notes.
          </div>
        )}
      </div>
    </div>
  );
};

const ProductivityTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const [activities, setActivities] = useState({});
  const [notes, setNotes] = useState({});
  const [hashtags, setHashtags] = useState({});
  const [searchTag, setSearchTag] = useState('');
  const [filteredResults, setFilteredResults] = useState(null);
  const [activeNotepad, setActiveNotepad] = useState(null);
  const [showAllNotes, setShowAllNotes] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const remainingSeconds = timeInSeconds % 60;
    
    return `${hours > 0 ? `${hours}:` : ''}` +
      `${minutes < 10 ? '0' : ''}${minutes}:` +
      `${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatTimestamp = (timestamp) => {
    const time = timestamp.time;
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours || 12; // if hours == 0, set to 12
    
    const strHours = hours.toString().padStart(2, '0');
    const strMinutes = minutes.toString().padStart(2, '0');
    
    return `${strHours}:${strMinutes} ${amPm}`;
  };

  const toggleTimer = () => {
    if (isActive) {
      // If timer is active, pause it: record the current interval's elapsed time and reset seconds to 0
      const now = new Date();
      setTimestamps([
        ...timestamps,
        {
          type: 'Interval',
          time: now,
          elapsedTime: seconds,
        },
      ]);
      setIsActive(false);
      setSeconds(0);
    } else {
      // If timer is not active, simply start/resume the timer without recording an event
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    if (seconds !== 0 && isActive) {
      const now = new Date();
      setTimestamps([
        ...timestamps,
        {
          type: 'Complete',
          time: now,
          elapsedTime: seconds,
        },
      ]);
    }
    
    setSeconds(0);
    setIsActive(false);
  };

  const calculateTagTime = (tag) => {
    if (!tag) return 0;
    
    let totalTime = 0;
    let previousTime = null;
    let previousIndex = null;
    
    timestamps.forEach((stamp, index) => {
      if (hashtags[index] && hashtags[index].includes(tag)) {
        if (previousTime !== null && previousIndex !== null) {
          const timeDiff = stamp.elapsedTime - previousTime;
          if (timeDiff > 0) totalTime += timeDiff;
        }
        previousTime = stamp.elapsedTime;
        previousIndex = index;
      }
    });
    
    if (
      isActive &&
      previousTime !== null &&
      hashtags[timestamps.length - 1] &&
      hashtags[timestamps.length - 1].includes(tag)
    ) {
      totalTime += seconds - previousTime;
    }
    
    return totalTime;
  };

  const handleSearch = () => {
    if (!searchTag.trim()) {
      setFilteredResults(null);
      return;
    }
    
    const tagTime = calculateTagTime(searchTag.trim());
    setFilteredResults({
      tag: searchTag.trim(),
      totalTime: tagTime,
    });
  };

  const handleNotepadOpen = (index) => {
    setActiveNotepad(index);
  };

  const handleNotepadSave = (noteData) => {
    if (activeNotepad !== null) {
      // Save the notes data
      const newNotes = { ...notes };
      newNotes[activeNotepad] = noteData;
      setNotes(newNotes);
      
      // Update the activity title if main ideas were added
      if (noteData.mainIdeas && noteData.mainIdeas.trim()) {
        const newActivities = { ...activities };
        newActivities[activeNotepad] = noteData.mainIdeas.split('\n')[0]; // Use first line as title
        setActivities(newActivities);
      }
      
      setActiveNotepad(null);
    }
  };

  const handleNotepadClose = () => {
    setActiveNotepad(null);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg w-full">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Productivity Timer</h2>
        
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setShowAllNotes(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors flex items-center"
          >
            <span className="mr-1">📝</span> View All Notes
          </button>
        </div>
        
        <div className="flex justify-center items-center space-x-2">
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search by tag (e.g. #work)"
            className="px-4 py-2 border rounded w-64"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
        
        {filteredResults && (
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="font-medium">Time spent on {filteredResults.tag}:</p>
            <p className="text-xl font-bold">{formatTime(filteredResults.totalTime)}</p>
          </div>
        )}
        
        <div className={`text-6xl font-bold text-blue-600 py-8 ${!isActive && seconds !== 0 ? 'animate-pulse' : ''}`}>
          {formatTime(seconds)}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={toggleTimer}
            className={`px-8 py-4 text-xl rounded-full transition-colors ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="ml-4 px-8 py-4 text-xl bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Timer History</h3>
          
          <div className="mb-2 text-right text-xs text-gray-500">
            Double-click on any activity to add detailed notes
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {timestamps.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 w-1/6">Timestamp</th>
                    <th className="pb-2 w-1/12">Elapsed</th>
                    <th className="pb-2 w-5/12">Activity</th>
                    <th className="pb-2 w-1/6">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {timestamps.map((stamp, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{formatTimestamp(stamp)}</td>
                      <td className="py-2">{formatTime(stamp.elapsedTime)}</td>
                      <td className="py-2">
                        <div 
                          className="relative w-full"
                          onDoubleClick={() => handleNotepadOpen(index)}
                        >
                          <input
                            type="text"
                            placeholder="What did you do?"
                            value={activities[index] || ''}
                            onChange={(e) => {
                              const newActivities = { ...activities };
                              newActivities[index] = e.target.value;
                              setActivities(newActivities);
                            }}
                            className={`w-full px-2 py-1 border rounded cursor-pointer ${notes[index] ? 'bg-blue-50' : ''}`}
                          />
                          {notes[index] && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500">
                              <span className="text-xs">📝</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        <input
                          type="text"
                          placeholder="#tag"
                          value={hashtags[index] || ''}
                          onChange={(e) => {
                            const newHashtags = { ...hashtags };
                            newHashtags[index] = e.target.value;
                            setHashtags(newHashtags);
                          }}
                          className="w-full px-2 py-1 border rounded text-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">No history yet</p>
            )}
          </div>
        </div>
      </div>
      
      {showAllNotes && (
        <AllNotesView
          notes={notes}
          activities={activities}
          timestamps={timestamps}
          hashtags={hashtags}
          onClose={() => setShowAllNotes(false)}
        />
      )}
      
      {activeNotepad !== null && (
        <NotePad
          title={activities[activeNotepad] || 'Untitled Activity'}
          activity={notes[activeNotepad]?.detailedNotes || ''}
          mainIdeas={notes[activeNotepad]?.mainIdeas || ''}
          onSave={handleNotepadSave}
          onClose={handleNotepadClose}
        />
      )}
    </div>
  );
};

export default ProductivityTimer;