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
-- Table structure for table `backgrounds`
--

CREATE TABLE `backgrounds` (
  `db_id` int(11) NOT NULL,
  `background_name` varchar(50) NOT NULL,
  `author_name` varchar(50) NOT NULL,
  `shape_type` varchar(10) NOT NULL,
  `shape_parameter_1` float NOT NULL,
  `shape_parameter_2` float NOT NULL,
  `shape_parameter_3` float NOT NULL,
  `shape_parameter_4` float NOT NULL,
  `shape_parameter_5` float NOT NULL,
  `shape_parameter_6` float NOT NULL,
  `auto_locate_flag` tinyint(1) NOT NULL,
  `image_filename_1` varchar(100) NOT NULL,
  `image_filename_2` varchar(100) NOT NULL,
  `image_filename_3` varchar(100) NOT NULL,
  `image_filename_4` varchar(100) NOT NULL,
  `image_filename_5` varchar(100) NOT NULL,
  `image_filename_6` varchar(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `backgrounds`
--

INSERT INTO `backgrounds` (`db_id`, `background_name`, `author_name`, `shape_type`, `shape_parameter_1`, `shape_parameter_2`, `shape_parameter_3`, `shape_parameter_4`, `shape_parameter_5`, `shape_parameter_6`, `auto_locate_flag`, `image_filename_1`, `image_filename_2`, `image_filename_3`, `image_filename_4`, `image_filename_5`, `image_filename_6`) VALUES
(2, 'Fifth and K box', 'Bill Grace', 'cube', 1000, 1000, 1000, 100, 200, 300, 1, 'image/homeWestMirrored.jpg', 'image/homeEastMirrored.jpg', '!8888ff', 'image/concrete.jpg', 'image/homeNorthMirrored.jpg', 'image/homeSouthMirrored.jpg'),
(12, 'Grand Canyon cylinder', 'Bill Grace', 'cylinder', 2000, 2000, 32, 0, 0, 0, 1, 'image/grandCanyonPanorama.jpg', 'image/starrySky.jpg', 'image/rockyShore.jpg', '0', '0', '0'),
(13, 'Heart Path box', 'Bill Grace', 'cube', 1000, 1000, 1000, 0, 0, 0, 1, 'image/heartPathWest.jpg', 'image/heartPathEast.jpg', '!90A0E0', '!102030', 'image/heartPathNorth.jpg', 'image/heartPathSouth.jpg'),
(14, 'Heart Path cylinder', 'Bill Grace', 'cylinder', 1000, 2000, 32, 0, 0, 0, 1, 'image/heartPathWestPanorama.jpg', '!90A0E0', '!102030', '', '', ''),
(15, 'Shop box', 'Bill Grace', 'cube', 2000, 2000, 2000, 0, 0, 0, 0, 'image/shopWestMirrored.jpg', 'image/shopEastMirrored.jpg', 'image/shopCeilingMirrored.jpg', 'image/shopFloorMirrored.jpg', 'image/shopNorthMirrored.jpg', 'image/shopSouthMirrored.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `backgrounds`
--
ALTER TABLE `backgrounds`
  ADD PRIMARY KEY (`db_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `backgrounds`
--
ALTER TABLE `backgrounds`
  MODIFY `db_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=16;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
