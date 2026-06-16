CC = gcc
CFLAGS = -Wall -pthread
SRC = src/main.c src/spooler.c src/user.c src/printer.c src/deadlock.c
OBJ = $(SRC:.c=.o)
EXEC = spooler

all: $(EXEC)

$(EXEC): $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^

clean:
	rm -f $(OBJ) $(EXEC)
