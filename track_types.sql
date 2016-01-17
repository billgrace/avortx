-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Jan 13, 2016 at 08:58 AM
-- Server version: 5.5.42
-- PHP Version: 5.6.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `avortx_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `track_types`
--

CREATE TABLE `track_types` (
  `db_id` int(11) NOT NULL,
  `track_type_name` varchar(50) NOT NULL,
  `author_name` varchar(50) NOT NULL,
  `thickness` float NOT NULL,
  `width` float NOT NULL,
  `small_piece_length` float NOT NULL,
  `slope_match_angle` float NOT NULL,
  `track_color` varchar(10) NOT NULL,
  `drag_point_radius` float NOT NULL,
  `drag_point_color` varchar(10) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `track_types`
--

INSERT INTO `track_types` (`db_id`, `track_type_name`, `author_name`, `thickness`, `width`, `small_piece_length`, `slope_match_angle`, `track_color`, `drag_point_radius`, `drag_point_color`) VALUES
(6, 'Paved', 'Bill Grace', 10, 30, 20, 0.1, '0x405060', 5, '0xff0000'),
(7, 'Narrow', 'Bill Grace', 10, 10, 20, 0.1, '0x4050FF', 35, '0xff9010'),
(8, 'White', 'Bill Grace', 10, 30, 20, 0.1, '0xFFFFFF', 4, '0x40C050');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `track_types`
--
ALTER TABLE `track_types`
  ADD PRIMARY KEY (`db_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `track_types`
--
ALTER TABLE `track_types`
  MODIFY `db_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
