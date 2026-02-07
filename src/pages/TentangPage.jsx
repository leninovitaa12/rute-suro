import React from 'react'
import { FaLightbulb, FaMap, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa'

export default function TentangPage() {
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Tentang Aplikasi Rute Suro</h1>
          <p className="page-subtitle">
            Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="content-grid">
            <div className="content-main">
              <h2 className="content-title">Cara Kerja Singkat</h2>
              
              <div className="work-steps">
                <div className="work-step">
                  <div className="work-step-number">1</div>
                  <div className="work-step-content">
                    <h3 className="work-step-title">Pilih Lokasi</h3>
                    <p className="work-step-description">
                      Anda dapat menentukan titik awal dan tujuan dengan cara klik langsung 
                      di peta interaktif atau memilih dari daftar event yang tersedia. 
                      Sistem akan menandai lokasi Anda dengan marker yang jelas.
                    </p>
                  </div>
                </div>

                <div className="work-step">
                  <div className="work-step-number">2</div>
                  <div className="work-step-content">
                    <h3 className="work-step-title">Pilih Metode Transportasi</h3>
                    <p className="work-step-description">
                      Tentukan preferensi transportasi Anda: jalan kaki, sepeda motor, 
                      mobil, atau transportasi umum. Setiap metode memiliki perhitungan 
                      waktu dan rute yang berbeda untuk kenyamanan maksimal.
                    </p>
                  </div>
                </div>

                <div className="work-step">
                  <div className="work-step-number">3</div>
                  <div className="work-step-content">
                    <h3 className="work-step-title">Sistem Menghitung Rute</h3>
                    <p className="work-step-description">
                      Algoritma A* kami menganalisis semua kemungkinan jalur dengan 
                      mempertimbangkan jarak, waktu tempuh, kondisi lalu lintas real-time, 
                      dan penutupan jalan untuk memberikan rute paling optimal.
                    </p>
                  </div>
                </div>

                <div className="work-step">
                  <div className="work-step-number">4</div>
                  <div className="work-step-content">
                    <h3 className="work-step-title">Ikuti Panduan Navigasi</h3>
                    <p className="work-step-description">
                      Rute ditampilkan dengan jelas di peta beserta estimasi waktu perjalanan. 
                      Ikuti panduan step-by-step untuk mencapai tujuan Anda dengan lancar 
                      dan efisien.
                    </p>
                  </div>
                </div>
              </div>

              <div className="info-box">
                <h3 className="info-box-title">
                  <FaLightbulb style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle', fontSize: '1.2rem' }} />
                  Kenapa Menggunakan Algoritma A*?
                </h3>
                <p className="info-box-text">
                  Algoritma A* adalah salah satu algoritma pencarian jalur terbaik yang 
                  menggabungkan kecepatan dan akurasi. Algoritma ini menggunakan heuristic 
                  function untuk memprediksi jarak ke tujuan, sehingga dapat menemukan 
                  rute optimal lebih cepat daripada algoritma tradisional seperti Dijkstra.
                </p>
              </div>
            </div>

            <div className="content-sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-title">Fitur Unggulan</h3>
                
                <div className="feature-list">
                  <div className="feature-list-item">
                    <div className="feature-list-icon">
                      <FaLightbulb />
                    </div>
                    <div>
                      <h4 className="feature-list-title">Algoritma A*</h4>
                      <p className="feature-list-text">
                        Perhitungan rute tercepat dengan akurasi tinggi
                      </p>
                    </div>
                  </div>

                  <div className="feature-list-item">
                    <div className="feature-list-icon">
                      <FaMap />
                    </div>
                    <div>
                      <h4 className="feature-list-title">Peta Interaktif</h4>
                      <p className="feature-list-text">
                        Visualisasi real-time dengan tampilan yang intuitif
                      </p>
                    </div>
                  </div>

                  <div className="feature-list-item">
                    <div className="feature-list-icon">
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <h4 className="feature-list-title">Real-time Traffic</h4>
                      <p className="feature-list-text">
                        Informasi lalu lintas langsung dan akurat
                      </p>
                    </div>
                  </div>

                  <div className="feature-list-item">
                    <div className="feature-list-icon">
                      <FaLightbulb />
                    </div>
                    <div>
                      <h4 className="feature-list-title">Event Integration</h4>
                      <p className="feature-list-text">
                        Terintegrasi dengan jadwal Grebeg Suro
                      </p>
                    </div>
                  </div>

                  <div className="feature-list-item">
                    <div className="feature-list-icon">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h4 className="feature-list-title">Admin Panel</h4>
                      <p className="feature-list-text">
                        Manajemen event dan rekayasa lalu lintas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-card">
                <h3 className="sidebar-title">Teknologi</h3>
                <div className="tech-tags">
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">Leaflet</span>
                  <span className="tech-tag">A* Algorithm</span>
                  <span className="tech-tag">OpenStreetMap</span>
                  <span className="tech-tag">Real-time Data</span>
                  <span className="tech-tag">Supabase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Pertanyaan Umum (FAQ)</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Apakah data rute akurat?</h3>
              <p className="faq-answer">
                Ya, sistem kami menggunakan data dari OpenStreetMap yang terus diperbarui 
                dan dikombinasikan dengan algoritma A* untuk memberikan rute paling akurat 
                dan efisien berdasarkan kondisi aktual.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Seberapa akurat estimasi waktu perjalanan?</h3>
              <p className="faq-answer">
                Estimasi waktu dihitung berdasarkan jarak, kondisi jalan, dan data traffic 
                real-time. Akurasi mencapai 85-90% tergantung kondisi lalu lintas yang 
                dapat berubah sewaktu-waktu.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Apakah sistem dapat menghindari jalan yang ditutup?</h3>
              <p className="faq-answer">
                Tentu! Sistem secara otomatis mendeteksi dan menghindari jalan yang ditutup 
                akibat acara atau rekayasa lalu lintas. Admin dapat mengelola penutupan 
                jalan melalui dashboard khusus.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Bagaimana cara mengakses info jadwal acara?</h3>
              <p className="faq-answer">
                Anda dapat mengakses jadwal lengkap acara Grebeg Suro melalui menu "Jadwal" 
                di navigasi atas. Informasi mencakup waktu, lokasi, dan detail setiap acara.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Apakah bisa digunakan offline?</h3>
              <p className="faq-answer">
                Saat ini aplikasi memerlukan koneksi internet untuk mengakses data peta 
                dan traffic real-time. Fitur offline sedang dalam pengembangan untuk 
                versi mendatang.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Siapa yang dapat mengakses Admin Panel?</h3>
              <p className="faq-answer">
                Admin Panel hanya dapat diakses oleh petugas berwenang dari Pemerintah 
                Kabupaten Ponorogo yang memiliki kredensial login khusus untuk mengelola 
                event dan rekayasa lalu lintas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}