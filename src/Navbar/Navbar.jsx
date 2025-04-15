import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';
import './NavbarComponent.css'; // Import custom styles


const NavbarComponent = () => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.backgroundColor = darkMode ? '#F0Bddd' : '#ffffff' ;
  };

  return (
    <Navbar expand="lg" className={`navbar ${darkMode ? 'dark' : ''}`} variant={darkMode ? 'dark' : 'light'}>
      <Container >
        <Navbar.Brand as={Link} to="/">
          <img
            src="/favicon.ico"
            alt="Logo"
            width="40"
            height="40"
          />
          {' '}
          ChartAp
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>

            <NavDropdown title="Stocks" id="stocks-dropdown">
              <NavDropdown.Item as={Link} to="/stocks/list">Stock List</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/stocks/analysis">Analysis</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Trends" id="trends-dropdown">
              <NavDropdown.Item as={Link} to="/trends/crypto">Crypto Trends</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/trends/stocks">Stock Trends</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Nav.Link as={Link} to="/register">Register</Nav.Link>
            <Nav.Link onClick={toggleDarkMode}>
              {darkMode ? <BsSunFill /> : <BsMoonFill />}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
