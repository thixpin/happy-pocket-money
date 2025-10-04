import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PaymentMethod, CreateGiveawayRequest } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 10px;
    border-radius: 15px;
  }
`;

const Title = styled.h1`
  color: #d4af37;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Checkbox = styled.input`
  margin: 0;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  background: #f0f9f4;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 20px;
`;

const CreateGiveaway: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<CreateGiveawayRequest>({
    budget: 1000,
    receiverCount: 5,
    paymentMethods: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdGiveaway, setCreatedGiveaway] = useState<any>(null);

  const paymentMethodOptions = [
    { value: PaymentMethod.WAVE, label: 'Wave Money' },
    { value: PaymentMethod.KPAY, label: 'kPay' },
    { value: PaymentMethod.AYAPAY, label: 'AyaPay' },
    { value: PaymentMethod.A_PLUS_WALLET, label: 'a+ Wallet' },
    { value: PaymentMethod.CB_PAY, label: 'CB Pay' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'receiverCount' ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const handlePaymentMethodChange = (method: PaymentMethod, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: checked 
        ? [...prev.paymentMethods, method]
        : prev.paymentMethods.filter(m => m !== method)
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validation
      if (formData.budget < 1000) {
        throw new Error('Budget must not be less than 1000');
      }
      if (formData.receiverCount < 2) {
        throw new Error('Receiver count must be at least 2');
      }
      if (formData.paymentMethods.length === 0) {
        throw new Error('Please select at least one payment method');
      }

      const response = await apiService.createGiveaway(formData);
      setCreatedGiveaway(response.giveaway);
      setSuccess('Giveaway created successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to create giveaway');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdGiveaway?.url) {
      navigator.clipboard.writeText(createdGiveaway.url);
      setSuccess('URL copied to clipboard!');
    }
  };

  return (
    <Container>
      <LogoutButton onClick={logout}>
        Logout ({user?.name})
      </LogoutButton>
      
      <Card>
        <Title>🎊 Create Pocket Money Giveaway</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        {createdGiveaway ? (
          <div>
            <h3>🎉 Giveaway Created!</h3>
            <p>Share this link with your friends:</p>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '6px', 
              marginBottom: '10px',
              wordBreak: 'break-all'
            }}>
              {createdGiveaway.url}
            </div>
            <Button onClick={copyToClipboard}>
              Copy Link
            </Button>
            <Button 
              onClick={() => navigate(`/giveaway/${createdGiveaway.hash}/dashboard`)}
              style={{ marginLeft: '10px', background: '#27ae60' }}
            >
              View Dashboard
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="budget">Total Budget (MMK)</Label>
              <Input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="1000"
                required
                placeholder="Enter amount in MMK"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="receiverCount">Number of Receivers</Label>
              <Select
                id="receiverCount"
                name="receiverCount"
                value={formData.receiverCount}
                onChange={handleInputChange}
                required
              >
                {Array.from({ length: 29 }, (_, i) => i + 2).map(num => (
                  <option key={num} value={num}>{num} people</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Payment Methods</Label>
              <CheckboxGroup>
                {paymentMethodOptions.map(option => (
                  <CheckboxLabel key={option.value}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.paymentMethods.includes(option.value)}
                      onChange={(e) => handlePaymentMethodChange(option.value, e.target.checked)}
                    />
                    {option.label}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </FormGroup>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Giveaway'}
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default CreateGiveaway;
