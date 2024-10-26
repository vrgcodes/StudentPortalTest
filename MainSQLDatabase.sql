-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: detention
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `Announcement` varchar(600) NOT NULL DEFAULT 'TBD',
  `Date` date NOT NULL DEFAULT '0000-00-00',
  `Time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dt_counter`
--

DROP TABLE IF EXISTS `dt_counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dt_counter` (
  `Name` varchar(100) NOT NULL,
  `Class` varchar(45) NOT NULL,
  `No_of_Detentions` int NOT NULL,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dt_counter`
--

LOCK TABLES `dt_counter` WRITE;
/*!40000 ALTER TABLE `dt_counter` DISABLE KEYS */;
INSERT INTO `dt_counter` VALUES ('Abdirahman Mohamoud Hassan Qalib','10C',1);
/*!40000 ALTER TABLE `dt_counter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `duties`
--

DROP TABLE IF EXISTS `duties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `duties` (
  `Name` varchar(70) NOT NULL DEFAULT 'TBD',
  `Duty` varchar(45) NOT NULL DEFAULT 'TBD',
  `Week` varchar(45) NOT NULL DEFAULT '0',
  `Status` varchar(45) NOT NULL DEFAULT 'TBD'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `duties`
--

LOCK TABLES `duties` WRITE;
/*!40000 ALTER TABLE `duties` DISABLE KEYS */;
/*!40000 ALTER TABLE `duties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `Event` varchar(200) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Time_From` time DEFAULT NULL,
  `Time_To` time DEFAULT NULL,
  `Scope` varchar(45) DEFAULT NULL,
  `Name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_info`
--

DROP TABLE IF EXISTS `login_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_info` (
  `Name` varchar(60) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(500) NOT NULL,
  `Status` varchar(45) NOT NULL DEFAULT 'TBD',
  `classAllocation` varchar(3) DEFAULT 'TBD',
  PRIMARY KEY (`Name`,`Email`,`Password`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  UNIQUE KEY `Password_UNIQUE` (`Password`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_info`
--

LOCK TABLES `login_info` WRITE;
/*!40000 ALTER TABLE `login_info` DISABLE KEYS */;
INSERT INTO `login_info` VALUES ('Admin','admin@nis.ac.ke','$2b$13$.1EnKdM2ETmWEd1YVgCtVOHJkbWYxytPdYnHoLWdGwxyWcwKKdmMO','Admin','TBD');
/*!40000 ALTER TABLE `login_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lunch_detention`
--

DROP TABLE IF EXISTS `lunch_detention`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lunch_detention` (
  `Date` date NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Class` varchar(3) NOT NULL,
  `Reason` varchar(45) NOT NULL,
  `Prefect_Teacher` varchar(100) NOT NULL,
  `Attendance` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lunch_detention`
--

LOCK TABLES `lunch_detention` WRITE;
/*!40000 ALTER TABLE `lunch_detention` DISABLE KEYS */;
/*!40000 ALTER TABLE `lunch_detention` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refreshtokens`
--

DROP TABLE IF EXISTS `refreshtokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refreshtokens` (
  `Refresh_Token` varchar(500) NOT NULL,
  PRIMARY KEY (`Refresh_Token`),
  UNIQUE KEY `Refresh_Token_UNIQUE` (`Refresh_Token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refreshtokens`
--

LOCK TABLES `refreshtokens` WRITE;
/*!40000 ALTER TABLE `refreshtokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refreshtokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saturday_detention`
--

DROP TABLE IF EXISTS `saturday_detention`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saturday_detention` (
  `Date` date NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Class` varchar(3) NOT NULL,
  `Reason` varchar(100) NOT NULL,
  `Prefect_Teacher` varchar(100) NOT NULL,
  `Attendance` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saturday_detention`
--

LOCK TABLES `saturday_detention` WRITE;
/*!40000 ALTER TABLE `saturday_detention` DISABLE KEYS */;
/*!40000 ALTER TABLE `saturday_detention` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saturday_dt_counter`
--

DROP TABLE IF EXISTS `saturday_dt_counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saturday_dt_counter` (
  `Name` varchar(100) NOT NULL,
  `Class` varchar(45) NOT NULL,
  `No_of_Saturday_Detentions` int NOT NULL,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saturday_dt_counter`
--

LOCK TABLES `saturday_dt_counter` WRITE;
/*!40000 ALTER TABLE `saturday_dt_counter` DISABLE KEYS */;
/*!40000 ALTER TABLE `saturday_dt_counter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `Full_Name` varchar(100) NOT NULL,
  `Class` varchar(3) NOT NULL,
  PRIMARY KEY (`Full_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('Aarav Dave','11B'),('Aaron Muturi Mwangi','12B'),('Abdirahman Mohamoud Hassan Qalib','10C'),('Abdulrahman Mohammed Awadh','12C'),('Abdulrahman Osman','12B'),('Abhinav Ajith Krishna','9C'),('Abigail Hasenye Nandokha','9B'),('Adam Thagara Kimathi','11C'),('Adeeb Hatim Ahmed','8A'),('Adnan Abdi Bare','9A'),('Adnan Khan','7B'),('Agol Adim Adim','11B'),('Ahmed Abdulkadir','9B'),('Ahmed Sirelkhatim Elsaied','11B'),('Aidan Jura Ochola','10A'),('Aiden Jawar Otachi','9A'),('Aixa Llopis-Sebastian','11A'),('Ajak Panek Biar','12C'),('Akira Nicole Ochieng','8B'),('Akshitha Thanu Moorthi','9A'),('Alabhaya Meharishi','10B'),('Alaina Khurram Awan','11A'),('Alan McNally','10C'),('Alefiyah Anjarwalla','12A'),('Alexander William Eidenbom','12B'),('Ali Tura Boru','10C'),('Allessander Lombard','7A'),('Alvin Kimathi','10B'),('Amal Cherian Thomas','9B'),('Amala Mary Paul','9B'),('Aman Manyol Yak','11A'),('Amanaldeen Moataz Abdelgadeir Ali','7C'),('Amani Onunga','11B'),('Amara Chebet Kipchirchir','9A'),('Ambrose Agbeko','11C'),('Ameya Singh','11C'),('Amy Wanjira Mukono','7A'),('Andrea Ann Thomas','11A'),('Andrew Kenneth New','8C'),('Andrew Kinyanjui','11A'),('Angel Wairimu Kinyanjui','10B'),('Angel Wairimu Nganga','8A'),('Annette Adoyo Omondi','10C'),('Anvir Sharma','10A'),('Arafa Adala','12A'),('Ariella Chepkoech Too','10C'),('Arinzechukwu Ozomamajuoyi','11C'),('Armaan Nimish Hadole','10B'),('Armaan Singh Ubhi','11A'),('Ashley Feldmann','11C'),('Ashley Wangari Ndirangu','12B'),('Atinan Zeleke Bacha','8C'),('Audrey Keinama','12C'),('Avantika Ranjit','11A'),('Avleen Kaur','7A'),('Avrillo Lombard','8C'),('Barka Bakhshuwein','10A'),('Bella Kasichana Dena','7B'),('Ben Kwame Ayugi','10C'),('Benjamin Koori Mwangi','9B'),('Benson Caleb Opeto','9B'),('Bianca Wanini','12A'),('Bibi Zainab','10C'),('Brayden Gweth Orego','9B'),('Brennan Hawi Mawira','8B'),('Bryanna Kamau','11A'),('Caden Baraka Maina','9B'),('Carl Kigen Kipkorir','10A'),('Chacko Abraham Vellakkottu','12A'),('Chantal Kamunde Kendi','12A'),('Charles Aloo Otieno','12C'),('Chloe Muita','11A'),('Chrige Ekanga Ngoy','11C'),('Christopher Ireri','7A'),('Christopher Mukundi Mubaiwa','10A'),('Cindy Adipo Adhiambo','7C'),('Corinne Mwirikia','8B'),('Cristina Wangui Kuria','7A'),('Crystal Wambui Mburia','8A'),('Curtis Ndombe Ngoy','9B'),('Dalya Muthoni Ngugi','10B'),('Danielle Njenga','12A'),('Darrell Muchiri Ngugi','11C'),('Darren Mumbo','12A'),('David Gathuku Kibathi','12B'),('David Micheal','10'),('David Mshindi Onyari','12A'),('David Oduor Oyugi','8A'),('Debra Jeloh Kitu','9C'),('Deng Marial Arthobei','7A'),('Dev Bharat Rao','11B'),('Dev Kanak Kotak','8C'),('Dev Shamji','8A'),('Dhruv Nautamlal Sanghani','8B'),('Dmitry Kitui Mumbe','10A'),('Dwyane Wairigu Kanyingi','12C'),('Dylan Carneiro','9A'),('Dylan Daniele Gori','12C'),('Dylan Faustine Oluoch','7B'),('Elaine Rachel Gitau','12A'),('Eliora Nawiky De Morais Manuel','12A'),('Ella Neema Odhiambo','8B'),('Elvina  Bleindou Aholie','9B'),('Eman Mohammed Gamal Al-Kubati','7A'),('Emmanuel Mugo Kamau','10B'),('Emmnauel Mwakio Kwanya','10A'),('Esther Dolo Karnley','10B'),('Esther Nyakio  Kabiru','9C'),('Ethan Gow','7A'),('Ethan Litsalia Mujera','7B'),('Faduma Abdi Ali Salaad','11C'),('Faheemah Abdullahi','12B'),('Feisal Hussein Abdi','10B'),('Feisal Ibnu Sheikh','7C'),('Florian  Kalungi Ssebunya','10B'),('Fortune Wacu Njoroge','7B'),('Gabriel John Oluoch','10C'),('Gakure Mburia','12A'),('Gauri Menon','7A'),('Geno Bolo','7B'),('George Chiuri Kagume','7B'),('Gianni Aldo Gori','10C'),('Gideon Mumo Katua','7A'),('Gift Kapesa Kapilya','8B'),('Gurvir Singh','12C'),('Hailey Mungu','9C'),('Hamza Garad Ahmed','9A'),('Hana Ismail','9A'),('Hanin Sami Yagoub Mohamed','10A'),('Hannah Kitu','8B'),('Hantao Huang','9C'),('Harveer Singh Chada','9C'),('Hashim Abdullahi Sheikhey Bahassan','11C'),('Hassan Abdi Ali Salaad','8B'),('Hawa Abdi Ali Salaad','10C'),('Hawi Bolo','9A'),('Hazel McMahon','7C'),('Hazel Zainab Hussein','8A'),('Henry Ongayo Onderi','9C'),('Hope Wainaina','10A'),('Ian Kabaru Wainaina','8A'),('Ian Kibet Kalyamoi','8B'),('Ibrahim Bin Lingo','11C'),('Idris Gatheru Mathenge','10A'),('Ikhavi Ouma-Namulu','8A'),('Imani Wanjiku Gathu','10C'),('Immanuel Walgwe Munyeki','11C'),('Imran Issa Issa','9B'),('Inaya Awan','9C'),('Ira Elsa Biju','11C'),('Ishaan Sil','10C'),('Ivanna Mugoh','10A'),('Ivy Kiburu','7C'),('Jada Azinga','12C'),('Jada Nyaboke Kendi Kailemia','8A'),('Jaden Jote Wakjira','9C'),('Jadon Hawi Orego','8C'),('Jaimie McCoy','11B'),('Jamillah Bint Lingo','8'),('Jasmine Moraa Omboga','11B'),('Jasmine Njeri Kamau','9A'),('Jaybrill Richards Begi','8C'),('Jazmine Muthoni Kiboro','7A'),('Jeevan Singh','8B'),('Jemale Abdiwahab HajiAli','10A'),('Jemimah Ronoh','11A'),('Jeremy Akanni Nyabira','10B'),('Jeremy Lenana Gikonyo','9C'),('Jesse Mukisa Ssebunya','9C'),('Jesse Munyua Kibathi','10B'),('Jessica  Nyanchama Momanyi','8B'),('Jia Cheng Gong','11C'),('Jiahao Miao','8B'),('Jingten Hu','8C'),('Jivraj Singh Matharu','7C'),('Joaquim Paulo Kalala Kassesse','11B'),('John-Silas Nyamato Omenge','12A'),('Jordan Alwar','12B'),('Joshua Louis Oromo','8A'),('Joy Muthoni Kamau','12A'),('Kahama Nderitu Kibaara','12C'),('Kai Nuo Leng','12C'),('Kaia Somaia','7B'),('Karampreet Kaur Ghataurhae','11A'),('Kareen Kaur Kalsi','9C'),('Karen Njeri Ngunjiri','9B'),('Karla Kirabo','7B'),('Karmine Makokha','10B'),('Kayla Ngina Mwanza','8C'),('Kelvin Carneiro','7C'),('Kemunto Kaveke Mariita','8C'),('Kenan Gitahi Marekia','11A'),('Kenia Wanjeri Gathungu','8B'),('Kerama Nyanyuki','10C'),('Kerubo Katanu Mariita','7C'),('Keza Anganile Mwampembwa','12C'),('Khadija Abdi Ali Salaad','10A'),('Khumaitha Khalid El-Busaidy','11C'),('Kiarie Karanja Mbugua','11B'),('Kimathi Mathiu','11A'),('Kimberly Kinoti','11B'),('Kimuhu Thuita','12A'),('Kiragu Kamau','10C'),('Koudje Samuel-Kenneth Ano Ahouadjoro','8C'),('Kristian Kibaki Maina','7C'),('Krystal Gathura','9A'),('Kweku Kipkorir Kipchirchir','11A'),('Kyle Dena','10C'),('Kyle Gachagua Nderitu','9C'),('Kyra Rozario','7A'),('Laimani Mungai','8A'),('Lakeesha Mahlia Kaisha','11B'),('Lalita Kahuha Latonia','11A'),('Lara Mutanu Nzivo','10C'),('Larry Jaden Njubi','11B'),('Latifah Dass','9B'),('Leeroy Muwo Kimae','9A'),('Leon Jason Osamba','7B'),('Leonidas Xavier Nyamato Omenge','9A'),('Levi Kinoti','9C'),('Liam Faraja Maina','7B'),('Lisa Hawi Otieno','10A'),('Lucca Wandera','10B'),('Lukonde Mwale','10B'),('Luqman Hussein Dahir','11C'),('Lusi Kamandala Minga','8A'),('Lyzette Chepkoech Sang','10A'),('Mabruka Abdirahman Adan','10A'),('Maina Kamau Gachomo','8A'),('Makyla Leli','9A'),('Malik Mepukori Kishanto','7C'),('Malik Mugambi','7B'),('Malika Akeyo Siage','9B'),('Malkia Atieno Onunga','8C'),('Manga Salifu','7C'),('Manxuan Liang','12B'),('Mara Noelle Alexis','8A'),('Marc Azinga','12C'),('Mariah Ronoh','9B'),('Mark Menesi','7A'),('Maryanne Wangui Ndung\'u','9C'),('Matthew Azinga','11B'),('Matthew Chilo Asura','12C'),('Matthew Kipkurui Koitaba','8A'),('McKayler Ariana Neema Galinoma','7A'),('Mellisa Nkatha Musagara','8C'),('Meroe Ntakirutimana','11B'),('Miaoke Meng','10C'),('Micah Nduranu Kiiru','8C'),('Mich Theuri','11C'),('Michelle  Mutheu Mutava','11A'),('Michelle Alexia','9C'),('Michelle Chebet Sigei','10B'),('Michelle Michael','11B'),('Michelle Wanjiku McMahon','12A'),('Mika Lindiwe Tshikala','10C'),('Mirye Gathungu','12C'),('Mohamedelashrf Ahmed','9A'),('Mohammed Alwathig Ahmed','10B'),('Mohammed Imaad Mawji','9C'),('Mohammed Jibran Mawji','10B'),('Mohammed Qays Mawji','12A'),('Moira Ajuot Bol Agau Adhil','8B'),('Morbe Kenyi','9B'),('Morgan Maxwell Tawi Murimi','8C'),('Motaman Sami Yagoub Mohamed','10C'),('Mukenu Gitonga Wahome','12C'),('Muortat Nyieer Gordon Muortart','7C'),('Mushada Judith Kutumbakana','12B'),('Mutuma Muriungi','7A'),('Muwahib Abdirahman Adan','10B'),('Mwara Kinya Njomo','11B'),('Mya Ogada','9C'),('Mysha Ali Asif Madni','9A'),('Nadine Gueth Chaukile Odhiambo','9C'),('Naemi Ghabr Zerezghi','8C'),('Nahashon Mwaura Ndung\'u','7C'),('Nailah Kendi Chesire','8C'),('Naim Irfan Mohamed','12C'),('Naima Makena Aende','10B'),('Nakita Mwendwa Laibuni','9C'),('Natalia Charles Natai','12C'),('Natasha Mungu','7C'),('Nathan Cherian Varghese','10C'),('Nathan Kageni','9B'),('Nathan Kimani','11B'),('Nathan Manthi Kyale','10B'),('Nathaniel Mutuota Mwangi','8A'),('Nawaal Faysal Ali','12B'),('Nazeen Qureshi','11A'),('Neema Tole','12C'),('Neema Wairimu Syekei','7C'),('Nemali Koe  Otupa','9C'),('Nicole Matheka','8B'),('Nicole Muthoni Kuria','8B'),('Nihal Ismail','12C'),('Nissi Priscah Mayaka','12B'),('Njeri Githaiga Maya','8C'),('Njeri Nemayian Waweru','10B'),('Noon Ahmed','7C'),('Noorani Khalif Hassan','10A'),('Nyadeng Machar','7B'),('Nyika Rienye','8A'),('Oceane Marguerite Ntakirutimana','9A'),('Olivier Karekezi','10C'),('Patrick Bleindou Aholie','9A'),('Pelamu Petal Ouko','10A'),('Pranav Suresh','11B'),('Prisha Walia','10C'),('Priyanka Walia','12B'),('Rajveer Menon','7A'),('Rashi Nakhwa','10C'),('Rehema  Sanare','12A'),('Rehema Chelangat Rutoh','8C'),('Rehema Wanja Kamau','11A'),('Ridley Noah Sawala','12B'),('Riley Munene','10A'),('Rishij Ghose','8C'),('Roda Atiel Benjamin','8B'),('Rosemary Waithera Mungu','7B'),('Rumaysa Salim Zein','9C'),('Rushil Brian Ferrer Amalor','11A'),('Ruth Gashahun Edossa','8B'),('Ryan Kaingu Gushe','10B'),('Saachi Nitin Satish','7C'),('Saad Mohamed','11B'),('Sabrina Mohamed Hussein','9B'),('Sadiya Patience Siriso Louis','9B'),('Saha Ndonga Okiya','7A'),('Saisha Jishit Malde','9B'),('Salaad Abdi Ali Salaad','8B'),('Salma Ahmed Garad','7C'),('Salma Nakaggya Kintu','9A'),('Samiira Garad Ahmed','11A'),('Samuel Momanyi','11B'),('Sany Kiragu Otieno','9C'),('Sau Bijou Syekei','9B'),('Sean McNally','12A'),('Sekeli Banda','12C'),('Serena Esther Njiru','12C'),('Shalom Ocholla','10B'),('Shamari Baraka Gioko','10A'),('Shannequa Alexis Pierre-Louis','9A'),('Shawn Kamau Wanjohi','9A'),('Shayana Wangeci Mahan','8C'),('Shayanna Nahlanie Edwards','7A'),('Sheikhan Salim','12A'),('Shona Alexandra Njuguna','9C'),('Shreya Sugathan Shaj','9C'),('ShuYing Li','9B'),('Simeon Miano Mathenge','9A'),('Siya Jose Kadarathil','9B'),('Smith Nzomo','11C'),('Sneha Mukherjee','9B'),('Stanley Joseph Muga','11A'),('Stephanie Kamau','9A'),('Stephen Maina','8A'),('Sumeiya Abdullahi Salaad','11B'),('Tafari Nyaga Kola','8C'),('Taksheel Dipakkumar Alagia','7B'),('Tanishka Shetty','12B'),('Tanush Shetty','7B'),('Tao Tao Zhang','10C'),('Tashongedzwanaishe Jane Moyo MacRobert','7B'),('Tatsha Amanya Otieno','9B'),('Tayiana Maya Konchellah Hurt','8A'),('Tendai Kola','10A'),('Thembisile Alubale Nolwazi','8B'),('Theodore Mirwai Okundi','8A'),('Tracey Dindi Wangalwa','11B'),('Tracy Mutola Otieno','7C'),('Tristan Nanzai Washika','8B'),('Tulsi Tilak Ruparel','9A'),('Tumaini Chabeda','10C'),('Tumaini Kanyingi','12B'),('Valdo Ganza Rudahunga','11A'),('Vansh Aggarwal','12A'),('Vasilis Gragory','8C'),('Veer Ramesh Gudhka','12A'),('Vivaan Khanna','10A'),('Waceke Katee','12C'),('Wambui Wangui Ngure','10C'),('Wanjiru Wahome','7B'),('Wei Chongmo','9A'),('Xiaoran Zhao','8A'),('Xingchuo Geng','7A'),('Xingzhuo Geng','12B'),('Xolani Kena Mambo','8B'),('Yahvi Parmar','12B'),('Yi Fan Huang','12A'),('Yi Hao Gong','10C'),('Yichen Duan','11C'),('Yisehak Endris','10A'),('YuLin Chen','10A'),('Yundi Li','10A'),('Yuvraj Sheoran','9A'),('Yvann Pierre Louis Rosevel','7B'),('Zakaria Muhyadin Abdulkadir','7A'),('Zawadi Wangui Ng\'ang\'a','9A'),('Zayan Bin Shijas','9B'),('Ze Han Yi','8A'),('Zeeshan bin Shijas','7C'),('Zeyu Meng','12A'),('Zhang Shuoqi','12B');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uniform`
--

DROP TABLE IF EXISTS `uniform`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniform` (
  `Date` date NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Class` varchar(3) NOT NULL,
  `Prefect_Teacher` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uniform`
--

LOCK TABLES `uniform` WRITE;
/*!40000 ALTER TABLE `uniform` DISABLE KEYS */;
/*!40000 ALTER TABLE `uniform` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uniform_counter`
--

DROP TABLE IF EXISTS `uniform_counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniform_counter` (
  `Name` varchar(100) NOT NULL,
  `Class` varchar(45) NOT NULL,
  `No_of_Violations` int NOT NULL,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uniform_counter`
--

LOCK TABLES `uniform_counter` WRITE;
/*!40000 ALTER TABLE `uniform_counter` DISABLE KEYS */;
/*!40000 ALTER TABLE `uniform_counter` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-22 21:54:57
