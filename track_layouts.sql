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
-- Table structure for table `track_layouts`
--

CREATE TABLE `track_layouts` (
  `db_id` int(11) NOT NULL,
  `track_layout_name` varchar(50) NOT NULL,
  `author_name` varchar(50) NOT NULL,
  `track_layout_id` int(11) NOT NULL,
  `section_sequence_number` int(11) NOT NULL,
  `section_type` varchar(10) NOT NULL,
  `section_parameter_1` float NOT NULL,
  `section_parameter_2` float NOT NULL,
  `section_parameter_3` float NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `track_layouts`
--

INSERT INTO `track_layouts` (`db_id`, `track_layout_name`, `author_name`, `track_layout_id`, `section_sequence_number`, `section_type`, `section_parameter_1`, `section_parameter_2`, `section_parameter_3`) VALUES
(31, 'Circle', 'Bill Grace', 2, 1, 'origin', 0, 0, 0),
(32, 'Circle', 'Bill Grace', 2, 2, 'direction', 1, 0, 0),
(33, 'Circle', 'Bill Grace', 2, 3, 'left', 0, 50, 1.5708),
(34, 'Circle', 'Bill Grace', 2, 4, 'left', 0, 50, 1.5708),
(35, 'Circle', 'Bill Grace', 2, 5, 'left', 0, 50, 1.5708),
(36, 'Circle', 'Bill Grace', 2, 6, 'left', 0, 50, 1.5708),
(37, 'Flat oval', 'Bill Grace', 3, 1, 'origin', 0, 0, 0),
(38, 'Flat oval', 'Bill Grace', 3, 2, 'direction', 1, 0, 0),
(39, 'Flat oval', 'Bill Grace', 3, 3, 'straight', 0, 150, 0),
(40, 'Flat oval', 'Bill Grace', 3, 4, 'left', 0, 50, 3.14159),
(41, 'Flat oval', 'Bill Grace', 3, 5, 'straight', 0, 150, 0),
(42, 'Flat oval', 'Bill Grace', 3, 6, 'left', 0, 50, 3.14159),
(43, 'Sloped oval', 'Bill Grace', 4, 1, 'origin', 0, 0, 0),
(44, 'Sloped oval', 'Bill Grace', 4, 2, 'direction', 1, 0, 0),
(45, 'Sloped oval', 'Bill Grace', 4, 3, 'straight', 20, 150, 0),
(46, 'Sloped oval', 'Bill Grace', 4, 4, 'left', 0, 50, 3.14159),
(47, 'Sloped oval', 'Bill Grace', 4, 5, 'straight', -20, 150, 0),
(48, 'Sloped oval', 'Bill Grace', 4, 6, 'left', 0, 50, 3.14159),
(49, 'Single loop', 'Bill Grace', 5, 1, 'origin', 0, 0, 0),
(50, 'Single loop', 'Bill Grace', 5, 2, 'direction', 1, 0, 0),
(51, 'Single loop', 'Bill Grace', 5, 3, 'straight', 0, 300, 0),
(52, 'Single loop', 'Bill Grace', 5, 4, 'left', 75, 50, 7.85398),
(53, 'Single loop', 'Bill Grace', 5, 5, 'straight', 0, 150, 0),
(54, 'Single loop', 'Bill Grace', 5, 6, 'left', 0, 50, 1.5708),
(55, 'Single loop', 'Bill Grace', 5, 7, 'straight', -75, 300, 0),
(56, 'Single loop', 'Bill Grace', 5, 8, 'left', 0, 50, 1.5708),
(57, 'Single loop', 'Bill Grace', 5, 9, 'straight', 0, 150, 0),
(58, 'Single loop', 'Bill Grace', 5, 10, 'left', 0, 50, 1.5708),
(59, 'Triple loop', 'Bill Grace', 6, 1, 'origin', 0, 0, 0),
(60, 'Triple loop', 'Bill Grace', 6, 2, 'direction', 1, 0, 0),
(61, 'Triple loop', 'Bill Grace', 6, 3, 'straight', 0, 500, 0),
(62, 'Triple loop', 'Bill Grace', 6, 4, 'left', 250, 50, 20.4204),
(63, 'Triple loop', 'Bill Grace', 6, 5, 'straight', 0, 150, 0),
(64, 'Triple loop', 'Bill Grace', 6, 6, 'left', 0, 50, 1.5708),
(65, 'Triple loop', 'Bill Grace', 6, 7, 'straight', -250, 500, 0),
(66, 'Triple loop', 'Bill Grace', 6, 8, 'left', 0, 50, 1.5708),
(67, 'Triple loop', 'Bill Grace', 6, 9, 'straight', 0, 150, 0),
(68, 'Triple loop', 'Bill Grace', 6, 10, 'left', 0, 50, 1.5708),
(69, 'Corkscrew elevator', 'Bill Grace', 7, 1, 'origin', 0, 0, 0),
(70, 'Corkscrew elevator', 'Bill Grace', 7, 2, 'direction', 1, 0, 0),
(71, 'Corkscrew elevator', 'Bill Grace', 7, 3, 'straight', 0, 500, 0),
(72, 'Corkscrew elevator', 'Bill Grace', 7, 4, 'left', 250, 50, 20.4204),
(73, 'Corkscrew elevator', 'Bill Grace', 7, 5, 'straight', 0, 150, 0),
(74, 'Corkscrew elevator', 'Bill Grace', 7, 6, 'left', 0, 50, 1.5708),
(75, 'Corkscrew elevator', 'Bill Grace', 7, 7, 'straight', 0, 500, 0),
(76, 'Corkscrew elevator', 'Bill Grace', 7, 8, 'left', -250, 50, 20.4204),
(77, 'Corkscrew elevator', 'Bill Grace', 7, 9, 'straight', 0, 150, 0),
(78, 'Corkscrew elevator', 'Bill Grace', 7, 10, 'left', 0, 50, 1.5708),
(79, 'Snake', 'Bill Grace', 8, 1, 'origin', 0, 0, 0),
(80, 'Snake', 'Bill Grace', 8, 2, 'direction', 0, 0, 1),
(81, 'Snake', 'Bill Grace', 8, 3, 'left', 0, 50, 3.14159),
(82, 'Snake', 'Bill Grace', 8, 4, 'right', 0, 50, 3.14159),
(83, 'Snake', 'Bill Grace', 8, 5, 'left', 0, 50, 3.14159),
(84, 'Snake', 'Bill Grace', 8, 6, 'right', 0, 50, 3.14159),
(85, 'Snake', 'Bill Grace', 8, 7, 'left', 0, 50, 3.14159),
(86, 'Snake', 'Bill Grace', 8, 8, 'right', 0, 50, 3.14159),
(87, 'Snake', 'Bill Grace', 8, 9, 'left', 0, 50, 3.14159),
(88, 'Snake', 'Bill Grace', 8, 10, 'straight', 0, 300, 0),
(89, 'Snake', 'Bill Grace', 8, 11, 'left', 0, 50, 1.5708),
(90, 'Snake', 'Bill Grace', 8, 12, 'straight', 0, 600, 0),
(91, 'Snake', 'Bill Grace', 8, 13, 'left', 0, 50, 1.5708),
(92, 'Snake', 'Bill Grace', 8, 14, 'straight', 0, 300, 0),
(93, 'Daytona Tri-oval', 'Bill Grace', 9, 1, 'origin', 0, 0, 0),
(94, 'Daytona Tri-oval', 'Bill Grace', 9, 2, 'direction', 0.927184, 0, 0.374607),
(95, 'Daytona Tri-oval', 'Bill Grace', 9, 3, 'straight', 0, 323.56, 0),
(96, 'Daytona Tri-oval', 'Bill Grace', 9, 4, 'left', 0, 200, 0.767945),
(97, 'Daytona Tri-oval', 'Bill Grace', 9, 5, 'straight', 0, 323.56, 0),
(98, 'Daytona Tri-oval', 'Bill Grace', 9, 6, 'left', 0, 200, 2.75762),
(99, 'Daytona Tri-oval', 'Bill Grace', 9, 7, 'straight', 0, 600, 0),
(100, 'Daytona Tri-oval', 'Bill Grace', 9, 8, 'left', 0, 200, 2.75762);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `track_layouts`
--
ALTER TABLE `track_layouts`
  ADD PRIMARY KEY (`db_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `track_layouts`
--
ALTER TABLE `track_layouts`
  MODIFY `db_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=101;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
