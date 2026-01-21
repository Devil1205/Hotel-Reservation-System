import React, { useState, useEffect } from 'react';

// Use relative URL for Vercel deployment, fallback to localhost for development
const API_BASE_URL = import.meta.env.PROD ? '/api/booking' : 'http://localhost:5000/booking';

function Booking() {
    const [rooms, setRooms] = useState([]);
    const [numOfRooms, setNumOfRooms] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch rooms on component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`);
            const data = await response.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            setMessage({ text: 'Failed to fetch rooms', type: 'error' });
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numOfRooms: parseInt(numOfRooms) })
            });
            const data = await response.json();
            
            if (data.success) {
                setRooms(data.data);
                setMessage({ text: data.message, type: 'success' });
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to book rooms', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                setRooms(data.data);
                setMessage({ text: data.message, type: 'success' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to reset bookings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRandom = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await fetch(`${API_BASE_URL}/random`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                setRooms(data.data);
                setMessage({ text: data.message, type: 'success' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to create random bookings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalRooms = rooms.reduce((acc, floor) => acc + floor.length, 0);
    const bookedRooms = rooms.reduce((acc, floor) => 
        acc + floor.filter(room => room.occupied.status===true).length, 0
    );
    const availableRooms = totalRooms - bookedRooms;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Hotel Room Reservation
                    </h1>
                    <p className="text-slate-400">Manage your hotel bookings efficiently</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs sm:text-sm">Total Rooms</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{totalRooms}</p>
                    </div>
                    <div className="bg-emerald-900/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/50">
                        <p className="text-emerald-400 text-xs sm:text-sm">Available</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{availableRooms}</p>
                    </div>
                    <div className="bg-rose-900/30 backdrop-blur-sm rounded-xl p-4 border border-rose-700/50">
                        <p className="text-rose-400 text-xs sm:text-sm">Booked</p>
                        <p className="text-2xl sm:text-3xl font-bold text-rose-400">{bookedRooms}</p>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
                    <form onSubmit={handleBook} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1">
                            <label className="block text-slate-400 text-sm mb-2">Number of Rooms (1-5)</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={numOfRooms}
                                onChange={(e) => setNumOfRooms(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                         transition-all duration-200"
                                placeholder="Enter number of rooms"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                                         text-white font-semibold rounded-lg transition-all duration-200
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                         focus:ring-offset-slate-800 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Book'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800
                                         text-white font-semibold rounded-lg transition-all duration-200
                                         focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 
                                         focus:ring-offset-slate-800 disabled:cursor-not-allowed"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleRandom}
                                disabled={loading}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800
                                         text-white font-semibold rounded-lg transition-all duration-200
                                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                                         focus:ring-offset-slate-800 disabled:cursor-not-allowed"
                            >
                                Random
                            </button>
                        </div>
                    </form>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mt-4 p-3 rounded-lg ${
                            message.type === 'success' 
                                ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-400' 
                                : 'bg-rose-900/50 border border-rose-700 text-rose-400'
                        }`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Room Grid */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Room Layout</h2>
                    
                    {/* Legend */}
                    <div className="flex gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-700 border-2 border-slate-500 rounded"></div>
                            <span className="text-slate-400 text-sm">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-400 rounded"></div>
                            <span className="text-slate-400 text-sm">Booked</span>
                        </div>
                    </div>

                    {/* Grid Container */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Column Headers */}
                            <div className="flex mb-2">
                                <div className="w-16 sm:w-20 shrink-0"></div>
                                {rooms[0]?.map((_, roomIndex) => (
                                    <div 
                                        key={roomIndex} 
                                        className="w-10 h-8 sm:w-12 shrink-0 flex items-center justify-center text-slate-400 text-xs sm:text-sm font-medium"
                                    >
                                        {roomIndex + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Floor Rows */}
                            <div className="flex">
                                {/* Elevator Shaft */}
                                <div className="w-8 sm:w-10 shrink-0 mr-2 relative">
                                    <div className="absolute inset-0 bg-linear-to-b from-slate-600 via-slate-700 to-slate-600 rounded-lg border-2 border-slate-500">
                                        <div className="absolute inset-x-1 top-1 bottom-1 bg-slate-800 rounded flex items-center justify-center">
                                            <span className="text-slate-400 text-[10px] sm:text-xs font-medium writing-mode-vertical transform -rotate-180" 
                                                  style={{ writingMode: 'vertical-rl' }}>
                                                LIFT
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rooms Grid */}
                                <div className="flex flex-col gap-2">
                                    {[...rooms].reverse().map((floor, idx) => {
                                        const floorIndex = rooms.length - 1 - idx;
                                        return (
                                        <div key={floorIndex} className="flex items-center">
                                            {/* Floor Label */}
                                            <div className="w-6 sm:w-8 shrink-0 text-slate-400 text-xs sm:text-sm font-medium">
                                                F{floorIndex + 1}
                                            </div>
                                            
                                            {/* Rooms */}
                                            <div className="flex gap-1 sm:gap-2">
                                                {floor.map((room, roomIndex) => (
                                                    <div
                                                        key={roomIndex}
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded border-2 flex items-center justify-center
                                                                  transition-all duration-300 cursor-default
                                                                  ${room.occupied.status===false 
                                                                      ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30' 
                                                                      : 'bg-slate-700 border-slate-500 hover:border-slate-400'
                                                                  }`}
                                                        title={`Room ${floorIndex + 1}${String(room.rno).padStart(2, '0')} - ${room.occupied.status===true ? 'Booked' : 'Available'}`}
                                                    >
                                                        <span className={`text-[10px] sm:text-xs font-medium ${
                                                            room.occupied.status===false ? 'text-white' : 'text-slate-400'
                                                        }`}>
                                                            {room.rno}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-slate-500 text-sm">
                    <p>Hotel Reservation System - Optimized for minimum travel time</p>
                </div>
            </div>
        </div>
    );
}

export default Booking;
