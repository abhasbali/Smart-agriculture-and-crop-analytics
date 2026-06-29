export default function Footer() {
  return (
    <footer className="gov-footer">
      <div className="gov-footer-inner">
        <div>
          <h5>Krishi Drishti</h5>
          <p>
            A hackathon-built unified platform for Indian crop analytics — ETL, ranking,
            visual dashboards, and an interactive water-stress risk map under a single
            FastAPI service. Frontend inspired by the layout of the government's UPAg portal.
          </p>
        </div>
        <div>
          <h5>Tech Stack</h5>
          <ul>
            <li>FastAPI · Pandas · NumPy</li>
            <li>Matplotlib · Folium</li>
            <li>React · Recharts · Leaflet</li>
            <li>Vite · Custom design tokens</li>
          </ul>
        </div>
        <div>
          <h5>Project by</h5>
          <ul>
            <li>Abhas Bali</li>
            <li>Ankit Jain</li>
            <li>Garvit Saini</li>
          </ul>
        </div>
      </div>
      <div className="gov-footer-bottom">
        <div>
          <span>© Smart Agriculture &amp; Crop Analytics — Python Data Science Hackathon</span>
          <span>Built with FastAPI · Pandas · React · Leaflet</span>
        </div>
        <img src="/crops/Srm%20University-04.jpg" alt="SRM University Logo" className="srm-logo" />
      </div>
    </footer>
  );
}
