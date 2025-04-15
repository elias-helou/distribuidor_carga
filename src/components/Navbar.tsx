"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Container, IconButton, Menu, MenuItem, useTheme } from "@mui/material";

interface IPages {
  name: string;
  link: string;
}

const navItems: IPages[] = [
  { name: "Home", link: "/" },
  { name: "Carregar dados", link: "/inputfile" },
  { name: "Atribuições", link: "/atribuicoes" },
  { name: "Seleção", link: "/select" },
  { name: "Histórico", link: "/history" },
  //{ name: "Parâmetros", link: "/parameters" },
  //{ name: "Restrições", link: "/restricoes" },
  //{ name: "Calendário", link: "/calendario" },
  { name: "Configurações", link: "/config" },
  { name: "Estatísticas", link: "/statistics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const theme = useTheme();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      component="nav"
      position="static"
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Menu hamburger para telas pequenas */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  backgroundColor: "#1976D2", // mesmo fundo da AppBar
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.name}
                  onClick={handleCloseNavMenu}
                  sx={{
                    paddingX: 2,
                  }}
                >
                  <Link href={item.link} passHref legacyBehavior>
                    <Button
                      component="a"
                      fullWidth
                      disableRipple
                      disabled={pathname === item.link}
                      sx={{
                        justifyContent:
                          pathname === item.link ? "center" : "flex-start",
                        color: pathname === item.link ? "#FFFFFF" : "#CFE3FC",
                        textTransform: "none",
                        fontWeight: "medium",
                        textShadow:
                          pathname === item.link
                            ? "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)"
                            : "none",
                        "&:hover": {
                          color: "#D1E9FF",
                          backgroundColor: "transparent",
                        },
                        "&.Mui-disabled": {
                          color: "#FFFFFF",
                          textShadow:
                            "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)",
                        },
                      }}
                    >
                      {pathname === item.link && (
                        <motion.div
                          layoutId="activeUnderline"
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "2px",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.name}
                      </motion.div>
                    </Button>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Itens da navbar para telas grandes */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => (
              <Link href={item.link} key={item.name} passHref legacyBehavior>
                <Button
                  component="a"
                  variant="text"
                  sx={{
                    position: "relative",
                    padding: "10px 20px",
                    fontWeight: "medium",
                    color: pathname === item.link ? "#FFFFFF" : "#CFE3FC",
                    textShadow:
                      pathname === item.link
                        ? "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)"
                        : "none",
                    "&:hover": {
                      color: "#D1E9FF",
                      backgroundColor: "transparent",
                    },
                    "&.Mui-disabled": {
                      color: "#FFFFFF",
                      textShadow:
                        "0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 12px rgba(255, 255, 255, 0.6)",
                    },
                  }}
                  disableRipple
                  disabled={pathname === item.link}
                >
                  {pathname === item.link && (
                    <motion.div
                      layoutId="activeUnderline"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: "#FFFFFF",
                        borderRadius: "2px",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.name}
                  </motion.div>
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
