import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = "IOH - Samet Yurttas";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050507",
          color: "#f6ecd2",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "76px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              color: "#f2c96d",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase"
            }}
          >
            {siteConfig.author}
          </div>
          <div style={{ fontSize: 118, fontWeight: 900, lineHeight: 0.9 }}>
            IOH
          </div>
          <div style={{ color: "#b6bfd0", fontSize: 38, maxWidth: 680 }}>
            Premium kitap evreni ve butik e-ticaret deneyimi
          </div>
        </div>
        <div
          style={{
            border: "2px solid rgba(242, 201, 109, 0.58)",
            borderRadius: 999,
            boxShadow: "0 0 90px rgba(242, 201, 109, 0.42)",
            height: 360,
            width: 360
          }}
        />
      </div>
    ),
    size
  );
}
