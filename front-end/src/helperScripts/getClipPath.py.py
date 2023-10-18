import numpy as np

def compute_y(x):
    return 2 * (0.5 * np.sin(x) + 0.2 * np.sin(x) * np.cos(x)**2) + 1

def get_clip_path():
    # Create x values between -pi/2 and 3pi/2, spaced by pi/8
    x_values = np.linspace(-np.pi/2, 3*np.pi/2, 16)
    # Compute y-values for each x-value
    y_values = [compute_y(x) for x in x_values]
    
    # Normalize y-values to range between 0% and 88%
    min_y = min(y_values)
    max_y = max(y_values)
    y_values_normalized = [(y - min_y) / (max_y - min_y) * 68 for y in y_values]
    
    # Define mapping of x-values to percentages between 20% and 80%
    x_percentages = np.linspace(30, 70, 16)
    
    # Create the clip-path polygon string
    clip_path_str = "-webkit-clip-path: polygon("
    
    # Add the points before 20%
    clip_path_str += "20% 0%, "
    
    # Add the computed points
    for x_perc, y_norm in zip(x_percentages, y_values_normalized):
        clip_path_str += f"{x_perc:.2f}% {y_norm:.2f}%, "
    
    clip_path_str += "80% 0%);"
    
    print(clip_path_str)

get_clip_path()