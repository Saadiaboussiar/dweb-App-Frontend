import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function IconTest() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => setShowPass(prev => !prev)}>
        Toggle
      </button>
      <div style={{ fontSize: '2rem', marginTop: '1rem' }}>
        <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
      </div>
    </div>
  );
}
