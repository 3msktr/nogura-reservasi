
-- This is a SQL function that needs to be executed in the Supabase SQL editor
-- Create a function to update available seats safely
CREATE OR REPLACE FUNCTION update_available_seats(p_session_id UUID, p_seats_to_reduce INT)
RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET availableseats = availableseats - p_seats_to_reduce
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
