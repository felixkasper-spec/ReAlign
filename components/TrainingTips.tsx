"use client";

import { useState } from "react";
import styles from "./TrainingTips.module.css";

const tips = [
  "Fokusera på att endast aktivera de muskler som ska jobba och slappna av i övriga muskler för att minska kompensation och främja rätt muskelaktivering.",
  "Inta rätt position i början av varje övning och behåll den genom hela rörelsen för att aktivera rätt muskler och undvika felaktig belastning.",
  "I de övningar med gradvis ökande tryck: börja med lätt muskelaktivering (cirka 1% av maximal kapacitet) och öka gradvis till cirka 40% av max på 2–3 sekunder.",
  "Kom till ett fullt stopp mellan varje repetition, gör varje rörelse kontrollerat, undvik att rycka dig igenom övningen.",
  "Vid stretching: Slappna av i muskeln som stretchas och håll det utsträckta läget. Öka stretchingen mjukt med varje utandning.",
  "Utför övningarna i angiven ordning, ofta har ordningen på övningarna ett syfte.",
  "Antalet repetitioner är en riktlinje; stoppa övningen tidigare än angett antal ifall du känner att du tappar tekniken, sikta på att göra fler nästa gång du gör övningen.",
  "Gör fler repetitioner på den sida som känns svagare/mindre funktionell tills balans uppnås.",
  "Fokusera på att övningarna känns lika på båda sidor för att uppnå optimal balans och funktion.",
  "Ingen övning ska göra ont! Vid smärta, kontrollera tekniken och justera om nödvändigt, minska antalet repetitioner, eller hoppa över övningen om smärtan kvarstår.",
  "Var närvarande i kroppen under träningen för att snabbare uppnå förbättringar; notera skillnader i spänning, balans och smärta före och efter passet.",
  "Drick ett stort glas vatten innan träningen för att optimera effekten på de djupa posturala musklerna.",
  "Läs instruktionerna noggrant för varje övning för att säkerställa korrekt utförande.",
];

export default function TrainingTips() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.toggle} ${open ? styles.open : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>💡 Tips att tänka på under träning för bästa möjliga resultat</span>
        <span className={styles.chev}>▾</span>
      </button>
      {open && (
        <div className={styles.panel}>
          <h3>Hur du kan tänka angående din träning</h3>
          <p className={styles.intro}>
            Nedan följer de allra viktigaste riktlinjerna att tänka på i
            samband med träningen:
          </p>
          <ul>
            {tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
          <p className={styles.closing}>
            Följer du dessa tips har du gett dig själv bästa möjliga
            förutsättningar, både i resultatsväg samt säkerhetsväg!
          </p>
        </div>
      )}
    </div>
  );
}
