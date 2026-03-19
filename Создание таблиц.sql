CREATE DATABASE Tourism;
GO

USE Tourism;
GO

-- 1. Создание таблицы-справочника стран
CREATE TABLE Countries (
    CountryID INT PRIMARY KEY IDENTITY(1,1),
    CountryName NVARCHAR(100) NOT NULL,
    IsVisaRequired BIT NOT NULL,
    Description NVARCHAR(MAX)
);

-- 2. Создание таблицы-справочника отелей
CREATE TABLE Hotels (
    HotelID INT PRIMARY KEY IDENTITY(1,1),
    HotelName NVARCHAR(200) NOT NULL,
    PricePerNight DECIMAL(10, 2) NOT NULL,
    CountryID INT,
    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID)
);

-- 3. Создание таблицы-справочника дополнительных услуг
CREATE TABLE Services (
    ServiceID INT PRIMARY KEY IDENTITY(1,1),
    ServiceName NVARCHAR(100) NOT NULL,
    ServicePrice DECIMAL(10, 2) NOT NULL
);

-- 4. Создание таблицы переменной информации (Бронирования)
CREATE TABLE Bookings (
    BookingID INT PRIMARY KEY IDENTITY(1,1),
    ClientName NVARCHAR(250) NOT NULL,
    HotelID INT,
    ServiceID INT,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    TotalCost DECIMAL(12, 2),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID)
);