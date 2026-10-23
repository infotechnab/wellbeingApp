import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '../button';

describe('Button', () => {
  it('renders its label and responds to presses', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Start" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Start' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Start" onPress={onPress} disabled />);

    await user.press(screen.getByRole('button', { name: 'Start' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
