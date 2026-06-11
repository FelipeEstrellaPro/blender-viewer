import "./globals.css";

export const metadata = {
  title: "Blender 3D Viewer | Visualizador de Modelos 3D",
  description: "Visualiza tus modelos 3D exportados desde Blender directamente en el navegador. Soporta GLB, GLTF, OBJ y FBX con múltiples modos de vista.",
  keywords: ["blender", "3d viewer", "glb", "gltf", "three.js", "webgl", "3d model viewer"],
  openGraph: {
    title: "Blender 3D Viewer",
    description: "Visualiza modelos 3D de Blender en tu navegador",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
