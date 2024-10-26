"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Link from "next/link";
import { usePathname } from 'next/navigation'

interface IPages {
  name: string;
  link: string;
}

const navItems: IPages[] = [
  { name: "Home", link: "/" },
  { name: "Carregar dados", link: "/inputfile" },
  { name: "Atribuições", link: "/atribuicoes" },
  { name: "Seleção", link: "/select" },
  { name: "Histórico", link: "/history"},
  {name: "Parâmetros", link: "parameters"}
];

export default function Navbar() {
  const pathname  = usePathname()

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav" position="relative">
        <Toolbar>
          <Box sx={{ display: { xs: "none", sm: "block"} }}>
            {navItems.map((item) => (
                <Button key={item.name} sx={{ color: "#fff", padding: 0, margin: '5px'}} disabled={pathname == item.link} variant={`${pathname == item.link ? 'contained' : 'text'}`}>
                  <Link
                    href={item.link}
                    style={{ textDecoration: "none", color: "white", padding: '5px' }}
                  >
                    {item.name}
                  </Link>
                </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
