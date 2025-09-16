import React, { useMemo } from 'react';
import Header from '../../global/header.jsx';
import Footer from '../../global/footer.jsx';
import { loadPersonsFromLocal } from '../../routes/datastore.js';
import { upcomingBday, upcomingAnniversary } from '../../utils/familyUtils.js';

function UpcomingEvents() {
  const persons = loadPersonsFromLocal() || [];

  const bdays = useMemo(() => upcomingBday(persons), [persons]);
  const annivs = useMemo(() => upcomingAnniversary(persons), [persons]);

  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <div className="container">
          <h2>Upcoming Events</h2>
          <p style={{ color: '#666' }}>Here are upcoming family events. Add items in code or extend this page to allow creating events.</p>

          <section style={{ marginTop: 12 }}>
            <h3>Birthdays this month</h3>
            {bdays.length === 0 ? (
              <div style={{ color: '#666' }}>No birthdays this month</div>
            ) : (
              <ul style={{ padding: 0, listStyle: 'none' }}>
                {bdays.map(b => (
                  <li key={b.personId} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <div style={{ color: '#666' }}>{b.dob} · Day {b.day}</div>
                  </li>
                ))}
              </ul>
            )}

            <h3 style={{ marginTop: 18 }}>Anniversaries this month</h3>
            {annivs.length === 0 ? (
              <div style={{ color: '#666' }}>No anniversaries this month</div>
            ) : (
              <ul style={{ padding: 0, listStyle: 'none' }}>
                {annivs.map(a => (
                  <li key={a.couple} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 700 }}>{a.couple}</div>
                    <div style={{ color: '#666' }}>{a.marriageDate} · Day {a.day}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default UpcomingEvents;
