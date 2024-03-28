// insertData.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { openDatabase } from './dbUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const data = req.body;
        const db = await openDatabase();
        try {
            await db.run(`
                INSERT INTO registrations (
                    employee, 
                    spouseJoining, 
                    numberOfChildren, 
                    numberOfChildrenOver18, 
                    shabbatObservance, 
                    numberOfRooms, 
                    connectingDoorNeeded, 
                    transportationNeeded, 
                    basketballTournamentNotification, 
                    totalPrice,
                    numberOfPeopleArriving
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.employee,
                data.spouseJoining ? 1 : 0,
                data.numberOfChildren,
                data.numberOfChildrenOver18,
                data.shabbatObservance ? 1 : 0,
                data.numberOfRooms,
                data.connectingDoorNeeded ? 1 : 0,
                data.transportationNeeded,
                data.basketballTournamentNotification ? 1 : 0,
                data.totalPrice,
                data.numberOfPeopleArriving
            ]);
      
            res.status(200).json({ message: 'Registration successful!' });
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: 'Error inserting data into the database' });
        } finally {
            await db.close();
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}