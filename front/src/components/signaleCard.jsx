 
 import "../css/Boutique.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'


function SignaleCard() {
return (
<>
<h2>Modale : signaler la boutique</h2>
<div className="modal-card">
    <h3>Signaler cette boutique</h3>
    <p className="hint">Merci de nous indiquer la raison. Notre équipe examinera votre signalement rapidement.</p>

    <label className="report-reason">
        <input type="radio" name="reportReason" value="contrefacon"/>
         Produits contrefaits ou non conformes</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="arnaque"/> Comportement suspect / arnaque</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="contenu"/> Contenu inapproprié</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="autre"/> Autre raison</label>

    <div className="field" style={{ marginTop: '12px' }}>
      <label>Précisez (facultatif)</label>
      <textarea id="reportDetails" placeholder="Ajoutez des détails…" style={{ minHeight: '70px' }}></textarea>
    </div>

    <div className="modal-actions">
      <button className="btn outline" id="closeReportBtn">Annuler</button>
      <button className="btn danger-outline" id="submitReportBtn">Envoyer le signalement</button>
    </div>
      </div>
 

</>

   





);




}
export default SignaleCard;
 
 
 