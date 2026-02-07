import React from "react";
import {
  FaMusic,
  FaLandmark,
  FaShoppingBag,
  FaHeart,
} from "react-icons/fa";

export default function SejarahPage() {
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Sejarah & Tradisi Event</h1>
          <p className="page-subtitle">
            Menyelami lebih dalam tradisi dan warisan budaya Grebeg Suro yang kaya akan makna dan sejarah
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="sejarah-intro">
            <div className="intro-image-placeholder">
              <div className="placeholder-icon">
                <FaMusic style={{ fontSize: "4rem" }} />
              </div>
              <p className="placeholder-text">Prosesi Kirab Pusaka</p>
            </div>

            <div className="intro-content">
              <h2 className="intro-title">Apa itu Grebeg Suro?</h2>
              <p className="intro-text">
                Grebeg Suro adalah upacara tradisional yang dilaksanakan setiap bulan Suro
                (Muharram) di Ponorogo, Jawa Timur. Acara ini merupakan salah satu warisan
                budaya yang masih dilestarikan hingga saat ini dan menjadi identitas penting
                masyarakat Ponorogo.
              </p>
              <p className="intro-text">
                Tradisi ini bermula dari masa Kerajaan Ponorogo dan terus diwariskan
                turun-temurun sebagai bentuk syukur, doa keselamatan, dan pelestarian
                nilai-nilai luhur budaya Jawa.
              </p>
            </div>
          </div>

          <div className="timeline-section">
            <h2 className="section-title">Lini Masa Transformasi</h2>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Asal Usul Spiritual</h3>
                  <p className="timeline-description">
                    Berawal dari tradisi spiritual kerajaan untuk menghormati leluhur
                    dan memohon berkah di awal tahun Jawa. Upacara ini melibatkan
                    prosesi kirab pusaka dan sesaji sebagai simbol penghormatan.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Transformasi Publik (1980-an)</h3>
                  <p className="timeline-description">
                    Tradisi mulai membuka diri untuk umum dan menjadi festival budaya
                    yang melibatkan masyarakat luas. Integrasi dengan seni pertunjukan
                    Reog Ponorogo memperkaya acara ini.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Modernisasi & Adaptasi Digital</h3>
                  <p className="timeline-description">
                    Integrasi teknologi untuk memudahkan akses informasi dan navigasi
                    selama acara berlangsung. Penggunaan aplikasi seperti Rute Suro
                    membantu optimalisasi perjalanan pengunjung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="budaya-section">
            <h2 className="section-title">Elemen Budaya Utama</h2>

            <div className="budaya-grid">
              <div className="budaya-card">
                <div className="budaya-icon">
                  <FaLandmark />
                </div>
                <h3 className="budaya-title">Kirab</h3>
                <p className="budaya-description">
                  Prosesi kirab pusaka keliling kota yang melibatkan ratusan peserta
                  dengan mengenakan busana adat. Kirab dimulai dari alun-alun dan
                  melewati titik-titik bersejarah di Ponorogo.
                </p>
              </div>

              <div className="budaya-card">
                <div className="budaya-icon">
                  <FaMusic />
                </div>
                <h3 className="budaya-title">Reog</h3>
                <p className="budaya-description">
                  Seni tari tradisional khas Ponorogo yang menampilkan penari dengan
                  topeng barongan besar. Pertunjukan ini menjadi daya tarik utama dan
                  simbol kebanggaan masyarakat Ponorogo.
                </p>
              </div>

              <div className="budaya-card">
                <div className="budaya-icon">
                  <FaMusic />
                </div>
                <h3 className="budaya-title">Gamelan</h3>
                <p className="budaya-description">
                  Iringan musik gamelan tradisional yang mengiringi setiap prosesi.
                  Alunan gamelan menciptakan atmosfer sakral dan khidmat selama acara
                  berlangsung.
                </p>
              </div>

              <div className="budaya-card">
                <div className="budaya-icon">
                  <FaShoppingBag />
                </div>
                <h3 className="budaya-title">Festival Rakyat</h3>
                <p className="budaya-description">
                  Berbagai kegiatan festival seperti bazaar kuliner, pameran kerajinan,
                  dan lomba seni turut meramaikan acara. Momen ini menjadi ajang
                  silaturahmi dan promosi UMKM lokal.
                </p>
              </div>
            </div>
          </div>

          <div className="quote-section">
            <div className="quote-card">
              <div className="quote-icon">
                <FaHeart />
              </div>
              <blockquote className="quote-text">
                "Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol
                persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk
                menjaga warisan leluhur sambil melangkah maju ke masa depan."
              </blockquote>
              <p className="quote-author">&mdash; Tokoh Budaya Ponorogo</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-title">Ingin Melihat Jadwal Lengkap?</h2>
            <p className="cta-text">
              Temukan semua jadwal acara Grebeg Suro dan rencanakan kunjungan Anda
            </p>
            <a
              href="/jadwal"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaMusic />
              Lihat Jadwal Event
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}