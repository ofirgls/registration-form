'use client';

import React, { useState, useEffect } from 'react';
import employees from '../employees/employees';

interface FormData {
    employee: string;
    spouseJoining: boolean;
    numberOfChildren: number;
    numberOfChildrenOver18: number;
    shabbatObservance: boolean;
    numberOfRooms: number;
    connectingDoorNeeded: boolean;
    transportationNeeded: number;
    basketballTournamentNotification: boolean;
    numberOfPeopleArriving: number;
    totalPrice: number;
}

const RegistrationForm: React.FC = () => {
    const roomOptions: number[] = [1, 2, 3, 4, 5];
    const [formData, setFormData] = useState<FormData>({
        employee: '',
        spouseJoining: false,
        numberOfChildren: 0,
        numberOfChildrenOver18: 0,
        shabbatObservance: false,
        numberOfRooms: roomOptions[0],
        connectingDoorNeeded: false,
        transportationNeeded: 0,
        basketballTournamentNotification: false,
        numberOfPeopleArriving: 1,
        totalPrice: 500
    });

    const [submitted, setSubmitted] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.employee) {
            setValidationError('Please select a valid employee.');
            return;
        }
        try {
            const response = await fetch('/api/webhooks/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setSubmitted(true);
                await saveToDatabase();
            } else {
                const errorText = await response.json();
                setValidationError(errorText.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setValidationError('An unexpected error occurred. Please try again later.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value) : value,
            totalPrice: calculateTotalPrice(name, value, type, prevState)
        }));
    };

    useEffect(() => {
        setFormData(prevState => ({
            ...prevState,
            totalPrice: calculateTotalPrice('', 0, '', prevState)
        }));
    }, [formData.spouseJoining, formData.numberOfChildren,formData.numberOfChildrenOver18,
        formData.numberOfRooms,formData.transportationNeeded, formData.shabbatObservance,
        formData.employee
    ]);

    useEffect(() => {
        if (formData.numberOfChildren === 0) {
            setFormData(prevState => ({
                ...prevState,
                numberOfChildrenOver18: 0
            }));
        }
    }, [formData.numberOfChildren]);

    const saveToDatabase = async () => {
        try {
            const response = await fetch('/api/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                console.log('Data inserted successfully into the database');
            } else {
                console.error('Failed to insert data into the database');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const ThankYouMessage: React.FC = () => {
        if (submitted) {
            return (
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Thank you for your order!</h2>
                    <p>Total Price: {Math.round(formData.totalPrice)} shekels</p>
                </div>
            );
        } else {
            return null;
        }
    };

    const calculateTotalPrice = (name: string, value: string | number, type: string, prevState: FormData) => {
        let newTotalPrice = 520;

        newTotalPrice += prevState.spouseJoining ? 120 : 0;
        newTotalPrice += formData.numberOfChildren * 60;
        newTotalPrice += formData.numberOfChildrenOver18 * 250;
        newTotalPrice += prevState.transportationNeeded * 25;
        newTotalPrice += (prevState.numberOfRooms - 1) * 500;
        newTotalPrice *= prevState.shabbatObservance ? 0.82 : 1;

        return Math.round(newTotalPrice);
    };

    const handleTransportationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: parseInt(value),
            totalPrice: calculateTotalPrice(name, value, 'select', prevState)
        }));
    };

    const BasketballTournamentRegistration: React.FC = () => {
        const showTournamentRegistration = formData.numberOfPeopleArriving > 5;
        if (showTournamentRegistration) {
            return (
                <div className="mb-4 text-black">
                    <label className="block mb-2">
                        <input
                            type="checkbox"
                            name="basketballTournamentNotification"
                            checked={formData.basketballTournamentNotification}
                            onChange={handleChange}
                        />
                        Register for Basketball Tournament
                    </label>
                </div>
            );
        } else {
            return null;
        }
    };

    const renderNumberOfChildrenOver18 = () => {
        if (formData.numberOfChildren > 0) {
            return (
                <div className="mb-4 text-black">
                    <label className="block mb-2" htmlFor="numberOfChildrenOver18">Number of Children over 18:</label>
                    <input type="number" id="numberOfChildrenOver18" name="numberOfChildrenOver18" value={formData.numberOfChildrenOver18} onChange={handleChange} min={0} max={formData.numberOfChildren} className="w-full px-4 py-2 border rounded-lg"
                        onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === ',') {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-900 to-black">
            {!submitted ? (
                <form onSubmit={handleSubmit} className="bg-gray-200 shadow-md rounded-lg p-8 max-w-md w-full md:max-w-lg">
                    <h1 className="text-center text-black text-2xl font-bold mb-4">Registration Form</h1>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="employee">Select Employee:</label>
                        <select id="employee" name="employee" value={formData.employee} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Select an employee</option>
                            {employees.map(employee => (
                                <option key={employee} value={employee}>{employee}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2">
                            <input type="checkbox" name="spouseJoining" checked={formData.spouseJoining} onChange={handleChange} />
                            Spouse Joining
                        </label>
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="numberOfChildren">Number of Children:</label>
                        <input id="numberOfChildren" type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} min={0} className="w-full px-4 py-2 border rounded-lg "
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === ',') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                    <div>
                        {renderNumberOfChildrenOver18()}
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="numberOfPeopleArriving">Number of People Arriving:</label>
                        <input id="numberOfPeopleArriving" type="number" name="numberOfPeopleArriving" value={formData.numberOfPeopleArriving} onChange={handleChange} min={1} className="w-full px-4 py-2 border rounded-lg "
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === ',') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="numberOfRooms">Number of Rooms:</label>
                        <select id="numberOfRooms" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                            {roomOptions.map(room => (
                                <option key={room} value={room}>{room}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="connectingDoorNeeded">
                            <input id="connectingDoorNeeded" type="checkbox" name="connectingDoorNeeded" checked={formData.connectingDoorNeeded} onChange={handleChange} />
                            Connecting Door Needed
                        </label>
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2" htmlFor="transportationNeeded">Need for Transportation:</label>
                        <select id="transportationNeeded" name="transportationNeeded" value={formData.transportationNeeded} onChange={handleTransportationChange} className="w-full px-4 py-2 border rounded-lg">
                            <option value={0}>No</option>
                            {Array.from({ length: formData.numberOfPeopleArriving }, (_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <BasketballTournamentRegistration />
                    </div>
                    <div className="mb-4 text-black">
                        <label className="block mb-2">
                            <input type="checkbox" name="shabbatObservance" checked={formData.shabbatObservance} onChange={handleChange} />
                            Shabbat Observance
                        </label>
                    </div>
                    {formData.totalPrice !== null && formData.totalPrice > 0 ? (
                        <div>
                            <p className="mb-4 text-black"> Total Price: {Math.round(formData.totalPrice)} shekels </p>
                        </div>
                    ) : (
                        <p className="text-red-500">You left the field "Number of Children" or the field "Number of Children over 18" without a value.
                        To know the total price please fill in the field.</p>
                    )}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
                    {validationError && <p className="text-red-500">{validationError}</p>}
                </form>
            ) : (
                <ThankYouMessage />
            )}
        </div>
    );
};

export default RegistrationForm;