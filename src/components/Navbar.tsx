"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";

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
  { name: "Calendário", link: "/calendario" },
  { name: "Configurações", link: "/config" },
];

export default function Navbar() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        position="static"
        sx={{
          backgroundColor: theme.palette.primary.main,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          //borderRadius: "0px 0px 15px 15px",
        }}
      >
        <Toolbar>
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {navItems.map((item) => (
              <Link href={item.link} key={item.name} passHref legacyBehavior>
                <Button
                  component="a"
                  variant="text"
                  sx={{
                    position: "relative",
                    padding: "10px 20px",
                    fontWeight: "medium",
                    color: pathname === item.link ? "#90CAF9" : "#E3F2FD",
                    textShadow:
                      pathname === item.link
                        ? "0px 0px 8px rgba(144, 202, 249, 0.9), 0px 0px 12px rgba(144, 202, 249, 0.7)"
                        : "none", // Neon azul em torno do texto branco ativo
                    "&:hover": {
                      color: "#BBDEFB",
                      backgroundColor: "transparent",
                    },
                    "&.Mui-disabled": {
                      color: "#FFFFFF", // Cor branca para o link selecionado
                      textShadow:
                        "0px 0px 8px rgba(144, 202, 249, 0.9), 0px 0px 12px rgba(144, 202, 249, 0.7)", // Neon azul no link ativo
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
                        backgroundColor: "#BBDEFB",
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
      </AppBar>
    </Box>
  );
}
