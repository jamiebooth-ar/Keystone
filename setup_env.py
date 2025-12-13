import os
import shutil

def setup_env():
    print("Welcome to Keystone Environment Setup")
    print("-------------------------------------")
    
    env_path = ".env"
    example_path = ".env.example"
    
    if not os.path.exists(example_path):
        print(f"Error: {example_path} not found.")
        return

    # Load existing values
    current_values = {}
    if os.path.exists(env_path):
        print(f"Found existing {env_path}, loading values...")
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    current_values[key] = value

    # Parse example file and prompt user
    new_lines = []
    with open(example_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                new_lines.append(line)
                continue
            
            if "=" in line:
                key, default_val = line.split("=", 1)
                
                # Determine default to show
                current_val = current_values.get(key)
                shown_default = current_val if current_val is not None else default_val
                
                user_input = input(f"{key} [{shown_default}]: ").strip()
                
                if user_input:
                    final_val = user_input
                else:
                    final_val = shown_default if shown_default else ""
                
                new_lines.append(f"{key}={final_val}")

    # Write back to .env
    print(f"\nWriting to {env_path}...")
    with open(env_path, "w") as f:
        for line in new_lines:
            f.write(line + "\n")
            
    print("Done! Environment configuration saved.")

if __name__ == "__main__":
    setup_env()
