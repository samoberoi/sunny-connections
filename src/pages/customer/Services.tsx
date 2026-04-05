import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/schedule-booking', { replace: true });
  }, [navigate]);
  return null;
}
