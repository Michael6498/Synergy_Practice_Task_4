const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    user: 'sa',
    password: '12345',
    server: '127.0.0.1',
    database: 'Tourism',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function start() {
    try {
        await sql.connect(config);
        console.log('✅ База подключена успешно');

        app.get('/api/data', async (req, res) => {
            try {
                const countries = await sql.query(`SELECT * FROM Countries`);
                const services = await sql.query(`SELECT * FROM Services`);
                const hotels = await sql.query(`
                    SELECT h.HotelID, h.HotelName, h.PricePerNight, h.CountryID, c.CountryName
                    FROM Hotels h
                    LEFT JOIN Countries c ON h.CountryID = c.CountryID
                `);
                const bookings = await sql.query(`
                    SELECT b.BookingID, b.ClientName, b.HotelID, b.ServiceID,
                           b.CheckInDate, b.CheckOutDate, b.TotalCost,
                           h.HotelName, c.CountryName
                    FROM Bookings b
                    LEFT JOIN Hotels h ON b.HotelID = h.HotelID
                    LEFT JOIN Countries c ON h.CountryID = c.CountryID
                `);
                res.json({
                    countries: countries.recordset,
                    hotels: hotels.recordset,
                    services: services.recordset,
                    bookings: bookings.recordset
                });
            } catch (err) {
                console.error('❌ ОШИБКА ПРИ ВЫБОРКЕ:', err.message);
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/api/bookings', async (req, res) => {
            try {
                const { ClientName, HotelID, ServiceID, CheckInDate, CheckOutDate, TotalCost } = req.body;
                const request = new sql.Request();
                request.input('ClientName', sql.NVarChar, ClientName);
                request.input('HotelID', sql.Int, HotelID);
                request.input('ServiceID', sql.Int, ServiceID || null);
                request.input('CheckInDate', sql.Date, CheckInDate);
                request.input('CheckOutDate', sql.Date, CheckOutDate);
                request.input('TotalCost', sql.Decimal(12, 2), TotalCost);
                await request.query(`
                    INSERT INTO Bookings (ClientName, HotelID, ServiceID, CheckInDate, CheckOutDate, TotalCost)
                    VALUES (@ClientName, @HotelID, @ServiceID, @CheckInDate, @CheckOutDate, @TotalCost)
                `);
                res.json({ success: true });
            } catch (err) {
                console.error('❌ ОШИБКА БРОНИ:', err.message);
                res.status(500).json({ error: err.message });
            }
        });

        app.delete('/api/bookings/:id', async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                console.log('>>> Удаляю бронь ID:', id);
                const request = new sql.Request();
                request.input('BookingID', sql.Int, id);
                await request.query(`DELETE FROM Bookings WHERE BookingID = @BookingID`);
                console.log('✅ Бронь удалена');
                res.json({ success: true });
            } catch (err) {
                console.error('❌ ОШИБКА УДАЛЕНИЯ:', err.message);
                res.status(500).json({ error: err.message });
            }
        });

        app.listen(3000, () => console.log('🚀 Сервер готов: http://localhost:3000'));

    } catch (err) {
        console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ:', err.message);
    }
}

start();
